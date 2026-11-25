import { Global, Module } from '@nestjs/common';
import { SupabaseService } from '../config/supabase.service';
import { ProfileRepository } from '../models/repositories/profile.repository';
import { StructureRepository } from '../models/repositories/structure.repository';
import { RegistrationRepository } from '../models/repositories/registration.repository';
import { AuthService } from '../models/services/auth.service';
import { UserService } from '../models/services/user.service';
import { StructureService } from '../models/services/structure.service';
import { ChurchService } from '../models/services/church.service';
import { PastorService } from '../models/services/pastor.service';
import { AttendanceService } from '../models/services/attendance.service';
import { ReportService } from '../models/services/report.service';

const PROVIDERS = [
  SupabaseService,
  ProfileRepository,
  StructureRepository,
  RegistrationRepository,
  AuthService,
  UserService,
  StructureService,
  ChurchService,
  PastorService,
  AttendanceService,
  ReportService,
];

@Global()
@Module({
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class CoreModule {}
