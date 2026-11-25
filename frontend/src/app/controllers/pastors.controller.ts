import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ChurchDto, PastorDto } from '../models/api.types';
import { RegistrationService } from '../models/registration/registration.service';
import { StructureService } from '../models/structure/structure.service';
import { PastorsView } from '../views/pastors/pastors.view';

@Component({
  selector: 'app-pastors-controller',
  standalone: true,
  imports: [PastorsView],
  template: `
    <app-pastors-view
      [pastors]="pastors()"
      [churches]="churches()"
      [loading]="loading()"
      [error]="error()"
      (create)="onCreate($event)"
      (remove)="onRemove($event)"
    />
  `,
})
export class PastorsController implements OnInit {
  private readonly registration = inject(RegistrationService);
  private readonly structure = inject(StructureService);

  readonly pastors = signal<PastorDto[]>([]);
  readonly churches = signal<ChurchDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({
      pastors: this.registration.pastors(),
      churches: this.structure.churches({ pageSize: 100 }),
    }).subscribe({
      next: ({ pastors, churches }) => {
        this.pastors.set(pastors.data);
        this.churches.set(churches.data.items);
        this.loading.set(false);
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo cargar la información');
        this.loading.set(false);
      },
    });
  }

  onCreate(body: { churchId: string | null; firstName: string; lastName: string }): void {
    this.registration.createPastor(body).subscribe({
      next: (response) => this.pastors.update((list) => [response.data, ...list]),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }

  onRemove(id: string): void {
    this.registration.deletePastor(id).subscribe({
      next: () => this.pastors.update((list) => list.filter((pastor) => pastor.id !== id)),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }
}
