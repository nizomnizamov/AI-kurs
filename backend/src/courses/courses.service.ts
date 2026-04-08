// ─── Courses Service (Production-Ready) ─────
// Fixed: N+1 queries, enrollment race condition, transaction safety
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Get All Published Courses ────────
  async findAll() {
    return this.prisma.course.findMany({
      where: { isPublished: true },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                orderIndex: true,
                isFree: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Get Course by ID ─────────────────
  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                orderIndex: true,
                isFree: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    return course;
  }

  // ─── Get Course by Slug ───────────────
  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                orderIndex: true,
                isFree: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    return course;
  }

  // ─── Enroll User in Course ────────────
  // FIXED: Transaction bilan atomik — race condition yo'q
  async enrollUser(userId: string, courseId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check course exists
      const course = await tx.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            orderBy: { orderIndex: 'asc' },
            include: {
              lessons: {
                orderBy: { orderIndex: 'asc' },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!course) {
        throw new NotFoundException('Kurs topilmadi');
      }

      // Check if already enrolled
      const existingEnrollment = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (existingEnrollment) {
        return { message: 'Siz allaqachon bu kursga yozilgansiz', alreadyEnrolled: true };
      }

      // Create enrollment
      await tx.enrollment.create({
        data: { userId, courseId },
      });

      // Initialize progress for all lessons
      // First lesson = AVAILABLE, rest = LOCKED
      const progressData: { userId: string; lessonId: string; status: 'AVAILABLE' | 'LOCKED' }[] = [];
      let isFirstLesson = true;

      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          progressData.push({
            userId,
            lessonId: lesson.id,
            status: isFirstLesson ? 'AVAILABLE' : 'LOCKED',
          });
          isFirstLesson = false;
        }
      }

      if (progressData.length > 0) {
        await tx.userProgress.createMany({
          data: progressData,
          skipDuplicates: true, // Agar allaqachon mavjud bo'lsa, xato bermasin
        });
      }

      return { message: 'Kursga muvaffaqiyatli yozildingiz!', alreadyEnrolled: false };
    }, {
      timeout: 15000, // 15s timeout — sekin connection uchun
    });
  }

  // ─── Get User's Enrolled Courses ──────
  // FIXED: N+1 query → bitta aggregation query bilan
  async getUserCourses(userId: string) {
    // 1. Foydalanuvchi yozilgan kurslarni olamiz
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                  select: { id: true, title: true, duration: true },
                },
              },
            },
          },
        },
      },
    });

    if (enrollments.length === 0) return [];

    // 2. Barcha kurslar uchun completed darslarni BITTA queryda olamiz
    const courseIds = enrollments.map((e) => e.courseId);

    const completedCounts = await this.prisma.userProgress.groupBy({
      by: ['lessonId'],
      where: {
        userId,
        status: 'COMPLETED',
        lesson: {
          module: {
            courseId: { in: courseIds },
          },
        },
      },
    });

    // 3. Har bir kurs uchun lessonId → courseId mapping yaratamiz
    const lessonToCourseMap = new Map<string, string>();
    for (const enrollment of enrollments) {
      for (const mod of enrollment.course.modules) {
        for (const lesson of mod.lessons) {
          lessonToCourseMap.set(lesson.id, enrollment.courseId);
        }
      }
    }

    // 4. CourseId bo'yicha completed count hisoblaymiz
    const completedByCourse = new Map<string, number>();
    for (const item of completedCounts) {
      const cId = lessonToCourseMap.get(item.lessonId);
      if (cId) {
        completedByCourse.set(cId, (completedByCourse.get(cId) || 0) + 1);
      }
    }

    // 5. Natijani formatlaymiz
    return enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0,
      );
      const completed = completedByCourse.get(enrollment.courseId) || 0;

      return {
        ...enrollment.course,
        enrolledAt: enrollment.enrolledAt,
        progress: {
          total: totalLessons,
          completed,
          percent: totalLessons > 0
            ? Math.round((completed / totalLessons) * 100)
            : 0,
        },
      };
    });
  }
}
