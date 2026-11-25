import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { ChurchFilter, StructureRepository } from '../repositories/structure.repository';
import { AuthUser, Church, ChurchDetail } from '../entities';

@Injectable()
export class ChurchService {
  constructor(private readonly repository: StructureRepository) {}

  list(user: AuthUser, filter: ChurchFilter): Promise<{ items: ChurchDetail[]; total: number }> {
    return this.repository.listChurches(user.accessToken, filter);
  }

  async get(user: AuthUser, id: string): Promise<ChurchDetail> {
    const church = await this.repository.getChurch(user.accessToken, id);
    if (!church) {
      throw new AppError('NOT_FOUND', 404);
    }
    return church;
  }

  async create(
    user: AuthUser,
    input: { districtId: string; name: string; address?: string; leadPastorId?: string | null },
  ): Promise<Church> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    return this.repository.createChurch(user.accessToken, input);
  }

  async update(
    user: AuthUser,
    id: string,
    input: { districtId?: string; name: string; address?: string },
  ): Promise<Church> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    return this.repository.updateChurch(user.accessToken, id, input);
  }

  async assignPastor(user: AuthUser, id: string, pastorId: string | null): Promise<Church> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    return this.repository.assignLeadPastor(user.accessToken, id, pastorId);
  }

  async deactivate(user: AuthUser, id: string): Promise<void> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    await this.repository.deactivateChurch(user.accessToken, id);
  }
}
