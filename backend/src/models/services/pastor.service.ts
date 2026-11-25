import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { RegistrationRepository } from '../repositories/registration.repository';
import { AuthUser, Pastor, PastorDetail } from '../entities';

@Injectable()
export class PastorService {
  constructor(private readonly repository: RegistrationRepository) {}

  list(user: AuthUser, churchId?: string, search?: string): Promise<PastorDetail[]> {
    return this.repository.listPastors(user.accessToken, churchId, search);
  }

  async create(
    user: AuthUser,
    input: { churchId?: string | null; firstName: string; lastName: string },
  ): Promise<Pastor> {
    if (!user.role || !['admin', 'operator'].includes(user.role)) {
      throw new AppError('FORBIDDEN', 403);
    }
    return this.repository.createPastor(user.accessToken, {
      churchId: input.churchId ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
      registeredBy: user.id,
    });
  }

  async update(
    user: AuthUser,
    id: string,
    input: { churchId?: string | null; firstName: string; lastName: string },
  ): Promise<Pastor> {
    if (!user.role || !['admin', 'operator'].includes(user.role)) {
      throw new AppError('FORBIDDEN', 403);
    }
    return this.repository.updatePastor(user.accessToken, id, {
      churchId: input.churchId ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  }

  async deactivate(user: AuthUser, id: string): Promise<void> {
    if (!user.role || !['admin', 'operator'].includes(user.role)) {
      throw new AppError('FORBIDDEN', 403);
    }
    await this.repository.deactivatePastor(user.accessToken, id);
  }
}
