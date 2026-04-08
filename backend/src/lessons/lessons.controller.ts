// ─── Lessons Controller ─────────────────────
import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators';

@Controller('lessons')
@UseGuards(AuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // ─── GET /lessons/:id ─────────────────
  @Get(':id')
  async getLesson(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getLesson(id, userId);
  }

  // ─── GET /lessons/:id/video ───────────
  @Get(':id/video')
  async getVideoUrl(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getSecureVideoUrl(id, userId);
  }

  // ─── GET /lessons/:id/next ────────────
  @Get(':id/next')
  async getNextLesson(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.lessonsService.getNextLesson(id, userId);
  }
}
