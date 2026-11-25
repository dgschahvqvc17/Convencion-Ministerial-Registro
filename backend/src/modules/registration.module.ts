import { Module } from '@nestjs/common';
import { PastorController } from '../controllers/pastor.controller';
import { AttendanceController } from '../controllers/attendance.controller';
import { EventController } from '../controllers/event.controller';
import { ReportController } from '../controllers/report.controller';

@Module({
  controllers: [PastorController, AttendanceController, EventController, ReportController],
})
export class RegistrationModule {}
