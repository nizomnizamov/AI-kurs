// ─── JWT Auth Guard ─────────────────────────
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DeviceService } from './device.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly deviceService: DeviceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token topilmadi');
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      // Verify device session is still valid
      const isSessionValid = await this.deviceService.validateSession(
        payload.sub,
        payload.deviceId,
      );

      if (!isSessionValid) {
        throw new UnauthorizedException(
          'Sessiya yaroqsiz. Boshqa qurilmadan kirish amalga oshirilgan bo\'lishi mumkin.',
        );
      }

      // Attach user info to request
      request['user'] = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        deviceId: payload.deviceId,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token yaroqsiz');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization as string | undefined;
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
