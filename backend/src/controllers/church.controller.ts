import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ChurchService } from '../models/services/church.service';
import { AuthUser } from '../models/entities';
import {
  AssignPastorRequest,
  CreateChurchRequest,
  UpdateChurchRequest,
} from '../views/dtos/requests';

@Controller('churches')
export class ChurchController {
  constructor(private readonly churches: ChurchService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('regionId') regionId?: string,
    @Query('districtId') districtId?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.churches.list(user, {
      regionId,
      districtId,
      search,
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 20)),
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.churches.get(user, id);
  }

  @Post()
  @Roles('admin')
  create(@CurrentUser() user: AuthUser, @Body() body: CreateChurchRequest) {
    return this.churches.create(user, body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: UpdateChurchRequest) {
    return this.churches.update(user, id, body);
  }

  @Patch(':id/pastor')
  @Roles('admin')
  assignPastor(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: AssignPastorRequest,
  ) {
    return this.churches.assignPastor(user, id, body.leadPastorId ?? null);
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.churches.deactivate(user, id);
    return { message: 'Iglesia desactivada' };
  }
}
