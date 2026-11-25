import { Body, Controller, Get, Patch, Param, Post } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserService } from '../models/services/user.service';
import { AuthUser } from '../models/entities';
import { CreateUserRequest, UpdateActiveRequest, UpdateRoleRequest } from '../views/dtos/requests';
import { toPublicUser } from '../views/mappers';

@Controller('users')
@Roles('admin')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  async list() {
    const users = await this.users.list();
    return users.map(toPublicUser);
  }

  @Post()
  async create(@Body() body: CreateUserRequest) {
    return toPublicUser(await this.users.create(body));
  }

  @Patch(':id/role')
  async assignRole(@Param('id') id: string, @Body() body: UpdateRoleRequest) {
    return toPublicUser(await this.users.assignRole(id, body.role));
  }

  @Patch(':id/active')
  async setActive(@Param('id') id: string, @Body() body: UpdateActiveRequest) {
    return toPublicUser(await this.users.setActive(id, Boolean(body.isActive)));
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return toPublicUser(user);
  }
}
