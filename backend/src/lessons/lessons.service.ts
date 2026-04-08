// ─── Lessons Service ────────────────────────
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ─── Get Lesson Details ───────────────
  async getLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Siz bu kursga yozilmagansiz');
    }

    // Check progress status
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (!progress || progress.status === 'LOCKED') {
      throw new ForbiddenException('Bu dars hali ochilmagan. Avvalgi darslarni yakunlang.');
    }

    // Don't expose raw video URL
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      orderIndex: lesson.orderIndex,
      moduleTitle: lesson.module.title,
      courseTitle: lesson.module.course.title,
      status: progress.status,
      watchPercent: progress.watchPercent,
    };
  }

  // ─── Get Secure Video URL ────────────
  async getSecureVideoUrl(lessonId: string, userId: string) {
    // Verify access first
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Siz bu kursga yozilmagansiz');
    }

    // Check progress
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (!progress || progress.status === 'LOCKED') {
      throw new ForbiddenException('Bu dars hali ochilmagan');
    }

    if (!lesson.videoUrl) {
      throw new NotFoundException('Video mavjud emas');
    }

    // Generate signed URL with expiration (security layer)
    const signedData = this.generateSignedVideoData(lesson.videoUrl, userId, lessonId);

    return {
      videoId: this.extractYouTubeId(lesson.videoUrl),
      signature: signedData.signature,
      expiresAt: signedData.expiresAt,
      embedUrl: signedData.embedUrl,
    };
  }

  // ─── Get Next Lesson ──────────────────
  async getNextLesson(currentLessonId: string, userId: string) {
    const currentLesson = await this.prisma.lesson.findUnique({
      where: { id: currentLessonId },
      include: { module: true },
    });

    if (!currentLesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Try to find next lesson in the same module
    let nextLesson = await this.prisma.lesson.findFirst({
      where: {
        moduleId: currentLesson.moduleId,
        orderIndex: currentLesson.orderIndex + 1,
      },
    });

    // If no next lesson in this module, find first lesson of next module
    if (!nextLesson) {
      const nextModule = await this.prisma.module.findFirst({
        where: {
          courseId: currentLesson.module.courseId,
          orderIndex: currentLesson.module.orderIndex + 1,
        },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
        },
      });

      if (nextModule && nextModule.lessons.length > 0) {
        nextLesson = nextModule.lessons[0];
      }
    }

    if (!nextLesson) {
      return {
        message: 'Tabriklaymiz! Siz barcha darslarni yakunladingiz! 🎉',
        courseCompleted: true,
      };
    }

    // Get progress for next lesson
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: nextLesson.id } },
    });

    return {
      lessonId: nextLesson.id,
      title: nextLesson.title,
      status: progress?.status || 'LOCKED',
      courseCompleted: false,
    };
  }

  // ─── Private: Generate Signed Video Data ──
  private generateSignedVideoData(
    videoUrl: string,
    userId: string,
    lessonId: string,
  ) {
    const secret = this.config.get('VIDEO_SIGNING_SECRET', 'default-secret');
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

    const dataToSign = `${userId}:${lessonId}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex');

    const videoId = this.extractYouTubeId(videoUrl);
    const embedUrl = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`
      : null;

    return { signature, expiresAt, embedUrl };
  }

  // ─── Private: Extract YouTube ID ─────
  private extractYouTubeId(url: string): string | null {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/, // Just the ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }
}
