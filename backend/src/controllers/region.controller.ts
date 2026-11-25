import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { StructureService } from '../models/services/structure.service';
import { AuthUser } from '../models/entities';
import { CreateRegionRequest } from '../views/dtos/requests';

@Controller('regions')
export class RegionController {
  constructor(private readonly structure: StructureService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.structure.listRegions(user);
  }

  @Post()
  @Roles('admin')
  create(@CurrentUser() user: AuthUser, @Body() body: CreateRegionRequest) {
    return this.structure.createRegion(user, body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: CreateRegionRequest) {
    return this.structure.updateRegion(user, id, body);
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.structure.deactivateRegion(user, id);
    return { message: 'Región desactivada' };
  }
}
