// ─── Auth DTOs ──────────────────────────────
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Ism kiritilishi shart' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Familiya kiritilishi shart' })
  lastName: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Parol kiritilishi shart' })
  password: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  deviceName?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
