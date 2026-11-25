import { AttendanceService } from '../../src/models/services/attendance.service';
import { AppError } from '../../src/errors/app-error';
import { AuthUser, Attendance } from '../../src/models/entities';
import { RegistrationRepository } from '../../src/models/repositories/registration.repository';

function fakeRepository(exists: boolean) {
  return {
    existsAttendance: jest.fn().mockResolvedValue(exists),
    createAttendance: jest.fn().mockImplementation(async (_token, input) => ({
      id: 'att-1',
      eventId: input.eventId,
      pastorId: input.pastorId,
      registeredBy: input.registeredBy,
      status: 'registered',
      checkedInAt: new Date().toISOString(),
      notes: input.notes ?? null,
    })),
    cancelAttendance: jest.fn().mockResolvedValue(undefined),
  } as unknown as RegistrationRepository;
}

const actor: AuthUser = {
  id: 'user-1',
  email: 'operator@convencion.org',
  fullName: 'María Pérez',
  role: 'operator',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  accessToken: 'token',
};

describe('AttendanceService', () => {
  it('registra la asistencia con el usuario que la creó', async () => {
    const repository = fakeRepository(false);
    const service = new AttendanceService(repository);

    const result: Attendance = await service.register(actor, {
      eventId: 'event-1',
      pastorId: 'pastor-1',
      notes: 'Sin observaciones',
    });

    expect(result.registeredBy).toBe('user-1');
    expect(result.status).toBe('registered');
  });

  it('rechaza un pastor duplicado en el mismo evento', async () => {
    const repository = fakeRepository(true);
    const service = new AttendanceService(repository);

    await expect(
      service.register(actor, { eventId: 'event-1', pastorId: 'pastor-1' }),
    ).rejects.toMatchObject({ code: 'DUPLICATE_ATTENDANCE', status: 409 } as Partial<AppError>);
  });
});
