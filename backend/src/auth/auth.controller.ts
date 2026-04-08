// ─── Auth Controller ────────────────────────
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { CurrentUser } from '../common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── POST /auth/register ──────────────
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─── POST /auth/login ─────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ipAddress =
      (req.headers?.['x-forwarded-for'] as string) ||
      req.socket?.remoteAddress ||
      'unknown';
    return this.authService.login(dto, ipAddress);
  }

  // ─── POST /auth/logout ────────────────
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @CurrentUser('deviceId') deviceId: string,
  ) {
    return this.authService.logout(userId, deviceId);
  }

  // ─── POST /auth/logout-all ────────────
  @Post('logout-all')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logoutAll(userId);
  }

  // ─── POST /auth/refresh ───────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ─── GET /auth/me ─────────────────────
  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.validateUser(userId);
  }

  // ─── GET /auth/sessions ───────────────
  @Get('sessions')
  @UseGuards(AuthGuard)
  async getActiveSessions(@CurrentUser('id') userId: string) {
    return this.authService.getActiveSessions(userId);
  }

  // ─── DELETE /auth/sessions/:deviceId ──
  @Delete('sessions/:deviceId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeSession(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.authService.logout(userId, deviceId);
  }
}
