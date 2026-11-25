import { Injectable } from '@nestjs/common';
import { RegistrationRepository, AttendanceFilter } from '../repositories/registration.repository';
import { StructureRepository } from '../repositories/structure.repository';
import { AttendanceDetail, AuthUser, DashboardStats, Event, ReportRow } from '../entities';

@Injectable()
export class ReportService {
  constructor(
    private readonly registration: RegistrationRepository,
    private readonly structure: StructureRepository,
  ) {}

  events(user: AuthUser): Promise<Event[]> {
    return this.registration.listEvents(user.accessToken);
  }

  activeEvent(user: AuthUser): Promise<Event | null> {
    return this.registration.activeEvent(user.accessToken);
  }

  attendances(
    user: AuthUser,
    filter: AttendanceFilter,
  ): Promise<{ items: AttendanceDetail[]; total: number }> {
    return this.registration.listAttendances(user.accessToken, filter);
  }

  summary(user: AuthUser): Promise<ReportRow[]> {
    return this.registration.report(user.accessToken);
  }

  async stats(user: AuthUser): Promise<DashboardStats> {
    const [regions, districts, churches, pastors, attendance] = await Promise.all([
      this.structure.listRegions(user.accessToken),
      this.structure.listDistricts(user.accessToken),
      this.structure.listChurches(user.accessToken, {
        page: 1,
        pageSize: 1,
      }),
      this.registration.listPastors(user.accessToken),
      this.registration.countAttendances(user.accessToken),
    ]);

    return {
      regions: regions.length,
      districts: districts.length,
      churches: churches.total,
      pastors: pastors.length,
      attendance,
    };
  }
}
