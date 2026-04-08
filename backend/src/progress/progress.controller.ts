// ─── Progress Controller ────────────────────
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators';

@Controller('progress')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // ─── GET /progress/course/:courseId ────
  @Get('course/:courseId')
  async getCourseProgress(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCourseProgress(userId, courseId);
  }

  // ─── POST /progress/lessons/:id/complete ──
  @Post('lessons/:id/complete')
  @HttpCode(HttpStatus.OK)
  async completeLesson(
    @CurrentUser('id') userId: string,
    @Param('id') lessonId: string,
  ) {
    return this.progressService.completeLesson(userId, lessonId);
  }

  // ─── PATCH /progress/lessons/:id/watch ────
  @Patch('lessons/:id/watch')
  async updateWatchProgress(
    @CurrentUser('id') userId: string,
    @Param('id') lessonId: string,
    @Body('watchPercent') watchPercent: number,
  ) {
    return this.progressService.updateWatchProgress(userId, lessonId, watchPercent);
  }
}
