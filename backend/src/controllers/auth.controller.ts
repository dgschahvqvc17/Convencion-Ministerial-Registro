import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService } from '../models/services/auth.service';
import { AuthUser, SessionTokens, UserDto } from '../models/entities';
import { LoginRequest } from '../views/dtos/requests';
import { toPublicUser } from '../views/mappers';
import { env } from '../config/env';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginRequest, @Res({ passthrough: true }) response: Response) {
    const { tokens, user } = await this.auth.login(body.email, body.password);
    this.setCookie(response, tokens);
    return toPublicUser(user);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): UserDto {
    return toPublicUser(user);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(env.cookieName, { path: '/' });
    return { message: 'Sesión cerrada' };
  }

  private setCookie(response: Response, tokens: SessionTokens): void {
    response.cookie(env.cookieName, JSON.stringify(tokens), {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
      path: '/',
    });
  }
}
