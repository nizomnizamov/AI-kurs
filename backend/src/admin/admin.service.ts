// ─── Admin Service ──────────────────────────
// Admin panel uchun kurs/modul/dars boshqarish
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ─── DTOs ─────────────────────────────────
interface CreateCourseDto {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  price?: number;
}

interface CreateModuleDto {
  courseId: string;
  title: string;
  orderIndex: number;
}

interface CreateLessonDto {
  moduleId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  orderIndex: number;
  isFree?: boolean;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ══════════════════════════════════════
  // COURSES
  // ══════════════════════════════════════

  async createCourse(data: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictException('Bu slug allaqachon mavjud');
    }

    return this.prisma.course.create({ data });
  }

  async updateCourse(id: string, data: Partial<CreateCourseDto>) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async publishCourse(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async deleteCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  // ══════════════════════════════════════
  // MODULES
  // ══════════════════════════════════════

  async createModule(data: CreateModuleDto) {
    return this.prisma.module.create({ data });
  }

  async updateModule(id: string, data: Partial<CreateModuleDto>) {
    return this.prisma.module.update({ where: { id }, data });
  }

  async deleteModule(id: string) {
    return this.prisma.module.delete({ where: { id } });
  }

  // ══════════════════════════════════════
  // LESSONS
  // ══════════════════════════════════════

  async createLesson(data: CreateLessonDto) {
    return this.prisma.lesson.create({ data });
  }

  async updateLesson(id: string, data: Partial<CreateLessonDto>) {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  // ══════════════════════════════════════
  // USERS (Admin view)
  // ══════════════════════════════════════

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
        _count: { select: { enrollments: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async approveUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
  }

  // ══════════════════════════════════════
  // STATS
  // ══════════════════════════════════════

  async getDashboardStats() {
    const [totalUsers, totalCourses, totalEnrollments, totalLessons] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.course.count(),
        this.prisma.enrollment.count(),
        this.prisma.lesson.count(),
      ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalLessons,
    };
  }
}
