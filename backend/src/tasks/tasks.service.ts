// ─── Scheduled Tasks Service ─────────────────
// Automated cleanup & maintenance jobs
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeviceService } from '../auth/device.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly deviceService: DeviceService) {}

  /**
   * Har 30 daqiqada expired sessionlarni tozalash
   * 50-60 user uchun session jadvalini toza tutish muhim
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleSessionCleanup() {
    this.logger.log('🔄 Running session cleanup...');
    try {
      const count = await this.deviceService.cleanupExpiredSessions();
      if (count > 0) {
        this.logger.log(`🧹 Session cleanup done: ${count} expired session(s) removed`);
      }
    } catch (error) {
      this.logger.error('Session cleanup failed', error);
    }
  }

  /**
   * Har kuni tunda 3:00 da to'liq tozalash
   */
  @Cron('0 3 * * *')
  async handleDailyMaintenance() {
    this.logger.log('🌙 Running daily maintenance...');
    try {
      await this.deviceService.cleanupExpiredSessions();
      this.logger.log('✅ Daily maintenance completed');
    } catch (error) {
      this.logger.error('Daily maintenance failed', error);
    }
  }
}
