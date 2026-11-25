import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ReportService } from '../models/services/report.service';
import { AuthUser } from '../models/entities';

@Controller('reports')
export class ReportController {
  constructor(private readonly reports: ReportService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthUser) {
    return this.reports.summary(user);
  }

  @Get('stats')
  stats(@CurrentUser() user: AuthUser) {
    return this.reports.stats(user);
  }
}
