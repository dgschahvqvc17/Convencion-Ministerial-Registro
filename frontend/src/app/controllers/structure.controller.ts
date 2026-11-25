import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ChurchDto, DistrictDto, RegionDto } from '../models/api.types';
import { StructureService } from '../models/structure/structure.service';
import {
  StructureEntity,
  StructureView,
} from '../views/structure/structure.view';

@Component({
  selector: 'app-structure-controller',
  standalone: true,
  imports: [StructureView],
  template: `
    <app-structure-view
      [regions]="regions()"
      [districts]="districts()"
      [churches]="churches()"
      [loading]="loading()"
      [error]="error()"
      (createRegion)="onRegion($event)"
      (createDistrict)="onDistrict($event)"
      (createChurch)="onChurch($event)"
      (deactivate)="onDeactivate($event)"
    />
  `,
})
export class StructureController implements OnInit {
  private readonly structure = inject(StructureService);

  readonly regions = signal<RegionDto[]>([]);
  readonly districts = signal<DistrictDto[]>([]);
  readonly churches = signal<ChurchDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    forkJoin({
      regions: this.structure.regions(),
      districts: this.structure.districts(),
      churches: this.structure.churches({ pageSize: 100 }),
    }).subscribe({
      next: ({ regions, districts, churches }) => {
        this.regions.set(regions.data);
        this.districts.set(districts.data);
        this.churches.set(churches.data.items);
        this.loading.set(false);
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo cargar la estructura');
        this.loading.set(false);
      },
    });
  }

  onRegion(body: { name: string; kind: 'departamento' | 'region'; country: string }): void {
    this.structure.createRegion(body).subscribe({
      next: () => this.refresh(),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }

  onDistrict(body: { regionId: string; name: string }): void {
    this.structure.createDistrict(body).subscribe({
      next: () => this.refresh(),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }

  onChurch(body: { districtId: string; name: string; address: string }): void {
    this.structure.createChurch(body).subscribe({
      next: () => this.refresh(),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }

  onDeactivate(event: { entity: StructureEntity; id: string }): void {
    const request =
      event.entity === 'region'
        ? this.structure.deleteRegion(event.id)
        : event.entity === 'district'
          ? this.structure.deleteDistrict(event.id)
          : this.structure.deleteChurch(event.id);

    request.subscribe({
      next: () => this.refresh(),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }
}
