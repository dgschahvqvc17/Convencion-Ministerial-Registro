import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AttendanceDto, EventDto, PastorDto } from '../models/api.types';
import { RegistrationService } from '../models/registration/registration.service';
import { AttendanceView } from '../views/attendance/attendance.view';

@Component({
  selector: 'app-attendance-controller',
  standalone: true,
  imports: [AttendanceView],
  template: `
    <app-attendance-view
      [pastors]="pastors()"
      [events]="events()"
      [records]="records()"
      [loading]="loading()"
      [saving]="saving()"
      [error]="error()"
      [success]="success()"
      (register)="onRegister($event)"
      (cancel)="onCancel($event)"
      (search)="onSearch($event)"
    />
  `,
})
export class AttendanceController implements OnInit {
  private readonly registration = inject(RegistrationService);

  readonly pastors = signal<PastorDto[]>([]);
  readonly events = signal<EventDto[]>([]);
  readonly records = signal<AttendanceDto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({
      pastors: this.registration.pastors(),
      events: this.registration.events(),
      records: this.registration.attendances({ pageSize: 30 }),
    }).subscribe({
      next: ({ pastors, events, records }) => {
        this.pastors.set(pastors.data);
        this.events.set(events.data);
        this.records.set(records.data.items);
        this.loading.set(false);
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo cargar la información');
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string): void {
    this.registration.pastors(undefined, term || undefined).subscribe({
      next: (response) => this.pastors.set(response.data),
      error: () => undefined,
    });
  }

  onRegister(body: { eventId: string; pastorId: string; notes: string }): void {
    this.saving.set(true);
    this.error.set(null);
    this.registration.register(body).subscribe({
      next: (response) => {
        this.records.update((list) => [response.data, ...list]);
        this.success.set('Asistencia registrada correctamente');
        this.saving.set(false);
        window.setTimeout(() => this.success.set(null), 3500);
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo registrar la asistencia');
        this.saving.set(false);
      },
    });
  }

  onCancel(id: string): void {
    this.registration.cancelAttendance(id).subscribe({
      next: () => {
        this.records.update((list) =>
          list.map((record) =>
            record.id === id ? { ...record, status: 'cancelled' as const } : record,
          ),
        );
      },
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }
}
