// ─── Root Application Module (Production-Ready) ─────
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({ isGlobal: true }),

    // Scheduled tasks (session cleanup, etc.)
    ScheduleModule.forRoot(),

    // Rate limiting: 50-60 ta user uchun moslashtirilgan
    // Har bir IP dan 120 request / 60 sekund
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 120,
    }]),

    // Feature modules
    PrismaModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    ProgressModule,
    AdminModule,
    HealthModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
