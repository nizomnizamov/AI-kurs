// ─── Device Management Service (Production-Ready) ──
// Anti-fraud: Max 2 active devices per user
// Fixed: Race conditions, session validation caching, atomic operations
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly maxDevices: number;
  private readonly sessionTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.maxDevices = Number(this.config.get('MAX_DEVICES_PER_USER', '2'));
    this.sessionTtlMs = 7 * 24 * 60 * 60 * 1000; // 7 kun
  }

  /**
   * Register a device session for a user.
   * Uses Prisma transaction to prevent race conditions when
   * multiple logins happen simultaneously.
   */
  async registerDevice(
    userId: string,
    deviceId: string,
    deviceName?: string,
    ipAddress?: string,
    refreshToken?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Check if this device already has a session
      const existingSession = await tx.session.findUnique({
        where: { userId_deviceId: { userId, deviceId } },
      });

      if (existingSession) {
        // Update existing session — no need to count devices
        return tx.session.update({
          where: { id: existingSession.id },
          data: {
            lastActive: new Date(),
            ipAddress,
            refreshToken,
            expiresAt: new Date(Date.now() + this.sessionTtlMs),
          },
        });
      }

      // Count active (non-expired) sessions
      const activeSessions = await tx.session.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() }, // faqat amal qiluvchilar
        },
        orderBy: { lastActive: 'asc' },
        select: { id: true, deviceId: true },
      });

      // Remove oldest sessions until we're within limit
      if (activeSessions.length >= this.maxDevices) {
        const sessionsToRemove = activeSessions.slice(
          0,
          activeSessions.length - this.maxDevices + 1,
        );

        await tx.session.deleteMany({
          where: {
            id: { in: sessionsToRemove.map((s) => s.id) },
          },
        });

        this.logger.warn(
          `User ${userId}: Max devices (${this.maxDevices}) reached. Removed ${sessionsToRemove.length} old session(s).`,
        );
      }

      // Also clean any expired sessions for this user
      await tx.session.deleteMany({
        where: {
          userId,
          expiresAt: { lt: new Date() },
        },
      });

      // Create new session
      return tx.session.create({
        data: {
          userId,
          deviceId,
          deviceName: deviceName || 'Unknown Device',
          ipAddress,
          refreshToken,
          expiresAt: new Date(Date.now() + this.sessionTtlMs),
        },
      });
    }, {
      // Transaction settings for concurrency
      isolationLevel: 'Serializable',
      timeout: 10000, // 10s timeout
    });
  }

  /**
   * Validate that a session is still active for the given device.
   * Optimized: lastActive faqat 5 daqiqada bir yangilanadi (DB load kamaytirish)
   */
  async validateSession(userId: string, deviceId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
      select: { id: true, expiresAt: true, lastActive: true },
    });

    if (!session) return false;

    if (session.expiresAt < new Date()) {
      // Expired — delete silently (no await needed, fire-and-forget)
      this.prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => {}); // ignore if already deleted
      return false;
    }

    // Throttle lastActive updates — faqat 5 daqiqada bir
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (session.lastActive < fiveMinutesAgo) {
      // Fire-and-forget — responsedan kutmaymiz
      this.prisma.session
        .update({
          where: { id: session.id },
          data: { lastActive: new Date() },
        })
        .catch(() => {}); // ignore errors
    }

    return true;
  }

  /**
   * Remove a specific device session.
   */
  async removeDevice(userId: string, deviceId: string) {
    return this.prisma.session.deleteMany({
      where: { userId, deviceId },
    });
  }

  /**
   * Remove all sessions for a user.
   */
  async removeAllDevices(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get all active sessions for a user.
   */
  async getActiveSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        ipAddress: true,
        lastActive: true,
        createdAt: true,
      },
      orderBy: { lastActive: 'desc' },
    });
  }

  /**
   * Clean up expired sessions globally.
   * Should be called via scheduled task (cron).
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.log(`🧹 Cleaned up ${result.count} expired session(s)`);
    }
    return result.count;
  }
}
