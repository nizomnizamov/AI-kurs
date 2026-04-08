// ─── Application Entry Point (Production-Ready) ─────
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Production logging level
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3001;

  // ─── Global Prefix ───────────────────
  app.setGlobalPrefix('api');

  // ─── Security ─────────────────────────
  app.use(helmet());

  // ─── CORS ─────────────────────────────
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
    maxAge: 3600, // CORS preflight cache — 1 soat
  });

  // ─── Validation ───────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Exception Filter ────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── Graceful Shutdown ────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`🚀 AI Course LMS API running on http://localhost:${port}/api`);
  logger.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
