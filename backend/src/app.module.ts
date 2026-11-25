import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CoreModule } from './modules/core.module';
import { AuthModule } from './modules/auth.module';
import { StructureModule } from './modules/structure.module';
import { RegistrationModule } from './modules/registration.module';
import { HealthController } from './controllers/health.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    AuthModule,
    StructureModule,
    RegistrationModule,
  ],
  controllers: [HealthController],
  providers: [
    Reflector,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
