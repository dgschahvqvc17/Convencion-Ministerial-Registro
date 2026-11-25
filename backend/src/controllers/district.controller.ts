import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { StructureService } from '../models/services/structure.service';
import { AuthUser } from '../models/entities';
import { CreateDistrictRequest, UpdateNameRequest } from '../views/dtos/requests';

@Controller('districts')
export class DistrictController {
  constructor(private readonly structure: StructureService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('regionId') regionId?: string) {
    return this.structure.listDistricts(user, regionId);
  }

  @Post()
  @Roles('admin')
  create(@CurrentUser() user: AuthUser, @Body() body: CreateDistrictRequest) {
    return this.structure.createDistrict(user, body.regionId, body.name);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateNameRequest,
  ) {
    return this.structure.updateDistrict(user, id, body.name);
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.structure.deactivateDistrict(user, id);
    return { message: 'Distrito desactivado' };
  }
}
