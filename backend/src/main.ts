import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Configuración global
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // React y Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

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

  // Comentar temporalmente hasta crear el filtro
  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3001);
  logger.log('🚀 Application is running on: http://localhost:3001');
}

void bootstrap();
