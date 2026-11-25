import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AttendanceService } from '../models/services/attendance.service';
import { ReportService } from '../models/services/report.service';
import { AttendanceStatus, AuthUser } from '../models/entities';
import { RegisterAttendanceRequest } from '../views/dtos/requests';

@Controller('attendances')
export class AttendanceController {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly reports: ReportService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('eventId') eventId?: string,
    @Query('regionId') regionId?: string,
    @Query('districtId') districtId?: string,
    @Query('churchId') churchId?: string,
    @Query('status') status?: AttendanceStatus,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.reports.attendances(user, {
      eventId,
      regionId,
      districtId,
      churchId,
      status,
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(100, Math.max(1, Number(pageSize) || 20)),
    });
  }

  @Post()
  @Roles('admin', 'operator')
  register(@CurrentUser() user: AuthUser, @Body() body: RegisterAttendanceRequest) {
    return this.attendance.register(user, body);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'operator')
  async cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.attendance.cancel(user, id);
    return { message: 'Asistencia cancelada' };
  }
}
