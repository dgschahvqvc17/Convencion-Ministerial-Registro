import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChurchDto, DistrictDto, RegionDto } from '../../models/api.types';
import { PageHeaderView, StateBlockView } from '../shared/ui.view';

export type StructureEntity = 'region' | 'district' | 'church';

@Component({
  selector: 'app-structure-view',
  standalone: true,
  imports: [FormsModule, PageHeaderView, StateBlockView],
  templateUrl: './structure.view.html',
  styleUrl: './structure.view.scss',
})
export class StructureView {
  readonly regions = input<RegionDto[]>([]);
  readonly districts = input<DistrictDto[]>([]);
  readonly churches = input<ChurchDto[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly createRegion = output<{ name: string; kind: 'departamento' | 'region'; country: string }>();
  readonly createDistrict = output<{ regionId: string; name: string }>();
  readonly createChurch = output<{ districtId: string; name: string; address: string }>();
  readonly deactivate = output<{ entity: StructureEntity; id: string }>();

  readonly tab = signal<'regiones' | 'distritos' | 'iglesias'>('regiones');

  regionName = '';
  regionKind: 'departamento' | 'region' = 'departamento';
  country = 'Bolivia';

  districtRegionId = '';
  districtName = '';

  churchDistrictId = '';
  churchName = '';
  churchAddress = '';

  search = '';

  submitRegion(): void {
    if (this.regionName.trim().length < 3) return;
    this.createRegion.emit({
      name: this.regionName.trim(),
      kind: this.regionKind,
      country: this.country.trim() || 'Bolivia',
    });
    this.regionName = '';
  }

  submitDistrict(): void {
    if (!this.districtRegionId || this.districtName.trim().length < 3) return;
    this.createDistrict.emit({
      regionId: this.districtRegionId,
      name: this.districtName.trim(),
    });
    this.districtName = '';
  }

  submitChurch(): void {
    if (!this.churchDistrictId || this.churchName.trim().length < 3) return;
    this.createChurch.emit({
      districtId: this.churchDistrictId,
      name: this.churchName.trim(),
      address: this.churchAddress.trim(),
    });
    this.churchName = '';
    this.churchAddress = '';
  }

  regionNameOf(id: string): string {
    return this.regions().find((region) => region.id === id)?.name ?? '—';
  }

  filteredChurches(): ChurchDto[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.churches();
    return this.churches().filter(
      (church) =>
        church.name.toLowerCase().includes(term) ||
        church.regionName.toLowerCase().includes(term) ||
        church.districtName.toLowerCase().includes(term),
    );
  }
}
