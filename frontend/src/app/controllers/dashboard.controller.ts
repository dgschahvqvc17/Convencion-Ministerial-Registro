import { Component, OnInit, inject, signal } from '@angular/core';
import { DashboardStatsDto, EventDto } from '../models/api.types';
import { AuthStore } from '../models/auth/auth.store';
import { RegistrationService } from '../models/registration/registration.service';
import { ReportsService } from '../models/reports/reports.service';
import { DashboardView } from '../views/dashboard/dashboard.view';

@Component({
  selector: 'app-dashboard-controller',
  standalone: true,
  imports: [DashboardView],
  template: `
    <app-dashboard-view
      [user]="store.user()"
      [stats]="stats()"
      [event]="event()"
      [error]="error()"
    />
  `,
})
export class DashboardController implements OnInit {
  readonly store = inject(AuthStore);
  private readonly reports = inject(ReportsService);
  private readonly registration = inject(RegistrationService);

  readonly stats = signal<DashboardStatsDto | null>(null);
  readonly event = signal<EventDto | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.reports.stats().subscribe({
      next: (response) => this.stats.set(response.data),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
    this.registration.activeEvent().subscribe({
      next: (response) => this.event.set(response.data),
      error: () => undefined,
    });
  }
}
