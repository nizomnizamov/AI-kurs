// ─── Admin Controller ───────────────────────
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard Stats ──────────────────
  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  // ─── Users ────────────────────────────
  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/toggle-active')
  async toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  // ─── Courses ──────────────────────────
  @Post('courses')
  async createCourse(@Body() data: any) {
    return this.adminService.createCourse(data);
  }

  @Put('courses/:id')
  async updateCourse(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCourse(id, data);
  }

  @Put('courses/:id/publish')
  async publishCourse(@Param('id') id: string) {
    return this.adminService.publishCourse(id);
  }

  @Delete('courses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  // ─── Modules ──────────────────────────
  @Post('modules')
  async createModule(@Body() data: any) {
    return this.adminService.createModule(data);
  }

  @Put('modules/:id')
  async updateModule(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateModule(id, data);
  }

  @Delete('modules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModule(@Param('id') id: string) {
    return this.adminService.deleteModule(id);
  }

  // ─── Lessons ──────────────────────────
  @Post('lessons')
  async createLesson(@Body() data: any) {
    return this.adminService.createLesson(data);
  }

  @Put('lessons/:id')
  async updateLesson(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateLesson(id, data);
  }

  @Delete('lessons/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLesson(@Param('id') id: string) {
    return this.adminService.deleteLesson(id);
  }
}
