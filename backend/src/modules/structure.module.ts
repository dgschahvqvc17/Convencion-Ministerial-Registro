import { Module } from '@nestjs/common';
import { RegionController } from '../controllers/region.controller';
import { DistrictController } from '../controllers/district.controller';
import { ChurchController } from '../controllers/church.controller';

@Module({
  controllers: [RegionController, DistrictController, ChurchController],
})
export class StructureModule {}
