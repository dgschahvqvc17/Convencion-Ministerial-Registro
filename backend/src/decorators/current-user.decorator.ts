import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../models/entities';

export const CurrentUser = createParamDecorator(
  (property: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;
    return property ? user?.[property] : user;
  },
);
