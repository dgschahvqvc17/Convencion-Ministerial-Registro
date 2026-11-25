import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PastorService } from '../models/services/pastor.service';
import { AuthUser } from '../models/entities';
import { CreatePastorRequest, UpdatePastorRequest } from '../views/dtos/requests';

@Controller('pastors')
export class PastorController {
  constructor(private readonly pastors: PastorService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('churchId') churchId?: string,
    @Query('search') search?: string,
  ) {
    return this.pastors.list(user, churchId, search);
  }

  @Post()
  @Roles('admin', 'operator')
  create(@CurrentUser() user: AuthUser, @Body() body: CreatePastorRequest) {
    return this.pastors.create(user, body);
  }

  @Patch(':id')
  @Roles('admin', 'operator')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: UpdatePastorRequest) {
    return this.pastors.update(user, id, body);
  }

  @Delete(':id')
  @Roles('admin', 'operator')
  async deactivate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.pastors.deactivate(user, id);
    return { message: 'Pastor desactivado' };
  }
}
