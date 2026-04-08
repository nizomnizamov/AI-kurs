// ─── Progress Service (Production-Ready) ────
// Sequential lesson progression with race condition protection
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Get Course Progress ──────────────
  async getCourseProgress(userId: string, courseId: string) {
    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      throw new ForbiddenException('Siz bu kursga yozilmagansiz');
    }

    // Get all modules with lessons and progress — BITTA query
    const modules = await this.prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: {
            progress: {
              where: { userId },
              select: {
                status: true,
                watchPercent: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    // Format response
    let totalLessons = 0;
    let completedLessons = 0;

    const formattedModules = modules.map((module) => ({
      id: module.id,
      title: module.title,
      orderIndex: module.orderIndex,
      lessons: module.lessons.map((lesson) => {
        totalLessons++;
        const progress = lesson.progress[0];
        const status = progress?.status || 'LOCKED';
        if (status === 'COMPLETED') completedLessons++;

        return {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          orderIndex: lesson.orderIndex,
          isFree: lesson.isFree,
          status,
          watchPercent: progress?.watchPercent || 0,
          completedAt: progress?.completedAt || null,
        };
      }),
    }));

    return {
      modules: formattedModules,
      stats: {
        totalLessons,
        completedLessons,
        progressPercent:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
      },
    };
  }

  // ─── Mark Lesson as Completed ─────────
  // FIXED: Transaction bilan — ikki marta bosishda race condition yo'q
  async completeLesson(userId: string, lessonId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Get the lesson with module info
      const lesson = await tx.lesson.findUnique({
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
      const enrollment = await tx.enrollment.findUnique({
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

      // Check current progress (SELECT FOR UPDATE equivalent via transaction)
      const progress = await tx.userProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });

      if (!progress) {
        throw new BadRequestException('Progress topilmadi');
      }

      if (progress.status === 'LOCKED') {
        throw new ForbiddenException('Bu dars hali ochilmagan');
      }

      // Agar allaqachon yakunlangan — idempotent response
      if (progress.status === 'COMPLETED') {
        return { message: 'Bu dars allaqachon yakunlangan', alreadyCompleted: true };
      }

      // Mark as completed
      await tx.userProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data: {
          status: 'COMPLETED',
          watchPercent: 100,
          completedAt: new Date(),
        },
      });

      // ─── UNLOCK NEXT LESSON (within same transaction) ──
      await this.unlockNextLesson(tx, userId, lesson);

      this.logger.log(
        `✅ User ${userId} completed: ${lesson.title}`,
      );

      return { message: 'Dars muvaffaqiyatli yakunlandi! ✅', alreadyCompleted: false };
    }, {
      timeout: 10000,
    });
  }

  // ─── Update Watch Progress ────────────
  async updateWatchProgress(
    userId: string,
    lessonId: string,
    watchPercent: number,
  ) {
    // Validate input
    if (typeof watchPercent !== 'number' || watchPercent < 0 || watchPercent > 100) {
      throw new BadRequestException('Watch percent 0-100 orasida bo\'lishi kerak');
    }

    const progress = await this.prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (!progress) {
      throw new BadRequestException('Progress topilmadi');
    }

    if (progress.status === 'LOCKED') {
      throw new ForbiddenException('Bu dars hali ochilmagan');
    }

    // Agar allaqachon yakunlangan — faqat watchPercent ni javob beramiz
    if (progress.status === 'COMPLETED') {
      return { watchPercent: 100, status: 'COMPLETED' };
    }

    // Only update if new percent is higher (prevent manipulation)
    const newPercent = Math.max(watchPercent, progress.watchPercent);

    if (watchPercent > progress.watchPercent) {
      await this.prisma.userProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data: { watchPercent: newPercent },
      });
    }

    // Auto-complete if watched >= 90%
    if (newPercent >= 90) {
      return this.completeLesson(userId, lessonId);
    }

    return { watchPercent: newPercent, status: 'AVAILABLE' };
  }

  // ─── Private: Unlock Next Lesson ──────
  // Now accepts transaction client (tx) for atomicity
  private async unlockNextLesson(
    tx: Prisma.TransactionClient,
    userId: string,
    currentLesson: any,
  ) {
    // Try to find the next lesson in the same module
    let nextLesson = await tx.lesson.findFirst({
      where: {
        moduleId: currentLesson.moduleId,
        orderIndex: currentLesson.orderIndex + 1,
      },
      select: { id: true, title: true },
    });

    // If no next lesson in this module, find the first lesson of next module
    if (!nextLesson) {
      const nextModule = await tx.module.findFirst({
        where: {
          courseId: currentLesson.module.courseId,
          orderIndex: currentLesson.module.orderIndex + 1,
        },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
            select: { id: true, title: true },
          },
        },
      });

      if (nextModule && nextModule.lessons.length > 0) {
        nextLesson = nextModule.lessons[0];
      }
    }

    if (nextLesson) {
      // Unlock the next lesson — upsert for safety
      await tx.userProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId: nextLesson.id },
        },
        update: {
          status: 'AVAILABLE',
        },
        create: {
          userId,
          lessonId: nextLesson.id,
          status: 'AVAILABLE',
        },
      });

      this.logger.log(
        `🔓 Unlocked: ${nextLesson.title} for user ${userId}`,
      );
    }
  }
}
