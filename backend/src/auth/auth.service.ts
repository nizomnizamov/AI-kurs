// ─── Auth Service (Production-Ready) ────────
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceService } from './device.service';
import { RegisterDto, LoginDto } from './dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  deviceId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly deviceService: DeviceService,
  ) {
    // salt round 10 — 12 juda sekin, 10 yetarli xavfsiz va tez
    this.bcryptRounds = 10;
  }

  // ─── Register ────────────────────────────
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  // ─── Login ───────────────────────────────
  async login(dto: LoginDto, ipAddress?: string) {
    const email = dto.email.toLowerCase().trim();

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akkaunt bloklangan');
    }

    if (!user.isApproved && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Hisobingiz hali admin tomonidan tasdiqlanmagan. Iltimos kuting.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    // Generate device ID if not provided
    const deviceId = dto.deviceId || uuidv4();

    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    });

    // Register device (enforces max 2 devices — transactional)
    await this.deviceService.registerDevice(
      user.id,
      deviceId,
      dto.deviceName,
      ipAddress,
      tokens.refreshToken,
    );

    this.logger.log(`User logged in: ${user.email} | device: ${deviceId}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      deviceId,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  // ─── Logout ──────────────────────────────
  async logout(userId: string, deviceId: string) {
    await this.deviceService.removeDevice(userId, deviceId);
    this.logger.log(`User logged out: ${userId} from device: ${deviceId}`);
    return { message: 'Muvaffaqiyatli chiqish amalga oshirildi' };
  }

  // ─── Logout All Devices ──────────────────
  async logoutAll(userId: string) {
    await this.deviceService.removeAllDevices(userId);
    return { message: 'Barcha qurilmalardan chiqish amalga oshirildi' };
  }

  // ─── Refresh Tokens ──────────────────────
  async refreshTokens(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      }) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Refresh token yaroqsiz yoki muddati tugagan');
    }

    // Verify session exists and is valid
    const isValid = await this.deviceService.validateSession(
      payload.sub,
      payload.deviceId,
    );

    if (!isValid) {
      throw new UnauthorizedException('Sessiya yaroqsiz. Qaytadan kiring.');
    }

    // Generate new tokens
    const tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      deviceId: payload.deviceId,
    });

    // Update refresh token in session
    try {
      await this.prisma.session.update({
        where: {
          userId_deviceId: {
            userId: payload.sub,
            deviceId: payload.deviceId,
          },
        },
        data: { refreshToken: tokens.refreshToken },
      });
    } catch {
      // Session may have been deleted between validation and update
      throw new UnauthorizedException('Sessiya topilmadi. Qaytadan kiring.');
    }

    return tokens;
  }

  // ─── Get Active Sessions ─────────────────
  async getActiveSessions(userId: string) {
    return this.deviceService.getActiveSessions(userId);
  }

  // ─── Validate User ──────────────────────
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi yoki bloklangan');
    }

    return user;
  }

  // ─── Generate Tokens ─────────────────────
  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
