// ─── Database Seed ──────────────────────────
// Namuna ma'lumotlar bilan DB ni to'ldirish
import { PrismaClient, Role, LessonStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create Admin User ────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibecoding.uz' },
    update: {},
    create: {
      email: 'admin@vibecoding.uz',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Nizamov',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─── Create Test Student ─────────────
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@test.uz' },
    update: {},
    create: {
      email: 'student@test.uz',
      passwordHash: studentPassword,
      firstName: 'Talaba',
      lastName: 'Testov',
      role: Role.STUDENT,
    },
  });
  console.log(`✅ Student user: ${student.email}`);

  // ─── Create Course ────────────────────
  const course = await prisma.course.upsert({
    where: { slug: 'vibe-coding-kursi' },
    update: {},
    create: {
      title: 'Vibe Coding kursi',
      slug: 'vibe-coding-kursi',
      description:
        'Murakkab platformalar, saytlar, botlar ishlab chiqish va biznesni avtomatlashtirish hamda MVP startaplarini yo\'lga qo\'yishni o\'rganasiz.',
      thumbnail: '/images/course-thumb.jpg',
      price: 0,
      isPublished: true,
    },
  });
  console.log(`✅ Course: ${course.title}`);

  // ─── Create Modules ──────────────────
  const modulesData = [
    {
      title: '01 — KUN · Kirish va sun\'iy intellekt modellari tahlili',
      orderIndex: 1,
      lessons: [
        {
          title: '01 — Kursdan qanday natijalar olaman?',
          orderIndex: 1,
          duration: 600,
          videoUrl: 'dQw4w9WgXcQ',
          isFree: true,
        },
        {
          title: '02 — Vibe Coding, LLM va AI Agent nima?',
          orderIndex: 2,
          duration: 900,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '03 — Google AI Pro bepul obuna va Antigravity sozlamalari',
          orderIndex: 3,
          duration: 720,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '04 — Amaliyot / Personal Link Hub ishlab chiqish',
          orderIndex: 4,
          duration: 1800,
          videoUrl: 'dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: '02 — KUN · Git & Github boshqaruvi va Vercel',
      orderIndex: 2,
      lessons: [
        {
          title: '05 — Git & Github nima va ulardan foydalanish',
          orderIndex: 1,
          duration: 1200,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '06 — Github va Vercel\'ga Agent orqali tezkor Deploy qilish',
          orderIndex: 2,
          duration: 900,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '07 — Saytimizga Custom Domain ulash va sozlash',
          orderIndex: 3,
          duration: 600,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '08 — Loyihalarni ishlab chiqish jarayonida uchraydigan muammolar (1)',
          orderIndex: 4,
          duration: 1500,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '09 — Loyihalarni ishlab chiqish jarayonida uchraydigan muammolar (2)',
          orderIndex: 5,
          duration: 1500,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '10 — Amaliyot Biznes moliyaviy holatini audit qiluvchi platforma ishlab chiqish',
          orderIndex: 6,
          duration: 2400,
          videoUrl: 'dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: '03 — KUN · Loyiha dizayni va texnik topshiriq qurish',
      orderIndex: 3,
      lessons: [
        {
          title: '11 — Loyiha dizaynini tushunish',
          orderIndex: 1,
          duration: 900,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '12 — Texnik topshiriq (TZ) yozish',
          orderIndex: 2,
          duration: 1200,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '13 — Amaliyot: Figma dan kodni generatsiya qilish',
          orderIndex: 3,
          duration: 1800,
          videoUrl: 'dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: '04 — KUN · Kursning amaliyot qismi',
      orderIndex: 4,
      lessons: [
        {
          title: '14 — Full-Stack loyiha yaratish',
          orderIndex: 1,
          duration: 2400,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '15 — Database va Backend integratsiya',
          orderIndex: 2,
          duration: 1800,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '16 — API yaratish va Frontend ulash',
          orderIndex: 3,
          duration: 2100,
          videoUrl: 'dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: '05 — KUN · No-Code dasturlash',
      orderIndex: 5,
      lessons: [
        {
          title: '17 — No-Code vositalar bilan ishlash',
          orderIndex: 1,
          duration: 1200,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '18 — Tilda bilan landing page yaratish',
          orderIndex: 2,
          duration: 1500,
          videoUrl: 'dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: '06 — KUN · Daromadga chiqish',
      orderIndex: 6,
      lessons: [
        {
          title: '19 — Freelance platformalarda ishlash',
          orderIndex: 1,
          duration: 900,
          videoUrl: 'dQw4w9WgXcQ',
        },
        {
          title: '20 — Portfolio yaratish va buyurtma olish',
          orderIndex: 2,
          duration: 1200,
          videoUrl: 'dQw4w9WgXcQ',
        },
      ],
    },
  ];

  for (const moduleData of modulesData) {
    const module = await prisma.module.upsert({
      where: {
        courseId_orderIndex: {
          courseId: course.id,
          orderIndex: moduleData.orderIndex,
        },
      },
      update: { title: moduleData.title },
      create: {
        courseId: course.id,
        title: moduleData.title,
        orderIndex: moduleData.orderIndex,
      },
    });

    for (const lessonData of moduleData.lessons) {
      await prisma.lesson.upsert({
        where: {
          moduleId_orderIndex: {
            moduleId: module.id,
            orderIndex: lessonData.orderIndex,
          },
        },
        update: {
          title: lessonData.title,
          videoUrl: lessonData.videoUrl,
          duration: lessonData.duration,
        },
        create: {
          moduleId: module.id,
          title: lessonData.title,
          orderIndex: lessonData.orderIndex,
          duration: lessonData.duration,
          videoUrl: lessonData.videoUrl,
          isFree: lessonData.isFree || false,
        },
      });
    }

    console.log(`  📦 Module: ${moduleData.title} (${moduleData.lessons.length} lessons)`);
  }

  // ─── Enroll Student in Course ─────────
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
  });

  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: { userId: student.id, courseId: course.id },
    });

    // Initialize progress: first lesson AVAILABLE, rest LOCKED
    const allModules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: { orderBy: { orderIndex: 'asc' } },
      },
    });

    let isFirst = true;
    for (const mod of allModules) {
      for (const lesson of mod.lessons) {
        await prisma.userProgress.upsert({
          where: {
            userId_lessonId: { userId: student.id, lessonId: lesson.id },
          },
          update: {},
          create: {
            userId: student.id,
            lessonId: lesson.id,
            status: isFirst ? LessonStatus.AVAILABLE : LessonStatus.LOCKED,
          },
        });
        isFirst = false;
      }
    }
    console.log(`✅ Student enrolled & progress initialized`);
  }

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
