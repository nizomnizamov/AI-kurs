// ─── Courses Controller ─────────────────────
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ─── GET /courses ─────────────────────
  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  // ─── GET /courses/my ──────────────────
  @Get('my')
  @UseGuards(AuthGuard)
  async getMyCourses(@CurrentUser('id') userId: string) {
    return this.coursesService.getUserCourses(userId);
  }

  // ─── GET /courses/:id ─────────────────
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  // ─── GET /courses/slug/:slug ──────────
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  // ─── POST /courses/:id/enroll ─────────
  @Post(':id/enroll')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async enroll(
    @CurrentUser('id') userId: string,
    @Param('id') courseId: string,
  ) {
    return this.coursesService.enrollUser(userId, courseId);
  }
}
