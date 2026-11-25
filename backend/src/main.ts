import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { env, validateEnv } from './config/env';
import { AppError } from './errors/app-error';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

function toDetails(errors: ValidationError[]): Record<string, string> {
  const details: Record<string, string> = {};
  for (const error of errors) {
    details[error.property] = Object.values(error.constraints ?? {})[0] ?? 'Campo inválido';
  }
  return details;
}

async function bootstrap(): Promise<void> {
  validateEnv();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: env.frontendUrl, credentials: true });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors) =>
        new AppError('VALIDATION_ERROR', 400, toDetails(errors)),
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(env.port);
  console.log(`API lista en http://localhost:${env.port}/api`);
}

void bootstrap();
