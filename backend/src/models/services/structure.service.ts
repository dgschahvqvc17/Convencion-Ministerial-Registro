import { Injectable } from '@nestjs/common';
import { AppError } from '../../errors/app-error';
import { StructureRepository } from '../repositories/structure.repository';
import { AuthUser, District, Region, RegionKind } from '../entities';

@Injectable()
export class StructureService {
  constructor(private readonly repository: StructureRepository) {}

  listRegions(user: AuthUser): Promise<Region[]> {
    return this.repository.listRegions(user.accessToken);
  }

  async createRegion(
    user: AuthUser,
    input: { name: string; kind: RegionKind; country?: string },
  ): Promise<Region> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    return this.repository.createRegion(user.accessToken, {
      name: input.name,
      kind: input.kind,
      country: input.country?.trim() || 'Bolivia',
    });
  }

  async updateRegion(
    user: AuthUser,
    id: string,
    input: { name: string; kind: RegionKind; country?: string },
  ): Promise<Region> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    return this.repository.updateRegion(user.accessToken, id, {
      name: input.name,
      kind: input.kind,
      country: input.country?.trim() || 'Bolivia',
    });
  }

  async deactivateRegion(user: AuthUser, id: string): Promise<void> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    await this.repository.deactivateRegion(user.accessToken, id);
  }

  listDistricts(user: AuthUser, regionId?: string): Promise<District[]> {
    return this.repository.listDistricts(user.accessToken, regionId);
  }

  async createDistrict(user: AuthUser, regionId: string, name: string): Promise<District> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    await this.ensureRegionExists(user, regionId);
    return this.repository.createDistrict(user.accessToken, regionId, name);
  }

  async updateDistrict(user: AuthUser, id: string, name: string): Promise<District> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    return this.repository.updateDistrict(user.accessToken, id, name);
  }

  async deactivateDistrict(user: AuthUser, id: string): Promise<void> {
    if (user.role !== 'admin') throw new AppError('FORBIDDEN', 403);
    await this.repository.deactivateDistrict(user.accessToken, id);
  }

  private async ensureRegionExists(user: AuthUser, regionId: string): Promise<void> {
    const regions = await this.repository.listRegions(user.accessToken);
    if (!regions.some((region) => region.id === regionId)) {
      throw new AppError('MISSING_PARENT', 404);
    }
  }
}
