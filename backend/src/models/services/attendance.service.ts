import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { RegistrationRepository } from '../repositories/registration.repository';
import { Attendance, AuthUser } from '../entities';

@Injectable()
export class AttendanceService {
  constructor(private readonly repository: RegistrationRepository) {}

  async register(
    user: AuthUser,
    input: { eventId: string; pastorId: string; notes?: string },
  ): Promise<Attendance> {
    const duplicated = await this.repository.existsAttendance(
      user.accessToken,
      input.eventId,
      input.pastorId,
    );
    if (duplicated) {
      throw new AppError('DUPLICATE_ATTENDANCE', 409);
    }

    return this.repository.createAttendance(user.accessToken, {
      eventId: input.eventId,
      pastorId: input.pastorId,
      registeredBy: user.id,
      notes: input.notes,
    });
  }

  async cancel(user: AuthUser, id: string): Promise<void> {
    await this.repository.cancelAttendance(user.accessToken, id);
  }
}
