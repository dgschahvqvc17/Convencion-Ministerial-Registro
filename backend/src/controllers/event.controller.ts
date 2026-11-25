import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ReportService } from '../models/services/report.service';
import { AuthUser } from '../models/entities';

@Controller('events')
export class EventController {
  constructor(private readonly reports: ReportService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.reports.events(user);
  }

  @Get('active')
  active(@CurrentUser() user: AuthUser) {
    return this.reports.activeEvent(user);
  }
}
