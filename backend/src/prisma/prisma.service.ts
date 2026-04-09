// ─── Prisma Service (Production-Ready) ──────
// Connection pooling & logging for 50-60 concurrent users
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Connection pool — har bir connection uchun 50-60 userni qo'llab-quvvatlash
      // Removing hardcoded datasource override to respect schema.prisma

      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        // Development: query loglarni yoqish mumkin
        // { emit: 'event', level: 'query' },
      ],
    });
  }

  async onModuleInit() {
    // Log Prisma events
    (this as any).$on('error', (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });

    (this as any).$on('warn', (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });

    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Health check — API health endpoint uchun
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
