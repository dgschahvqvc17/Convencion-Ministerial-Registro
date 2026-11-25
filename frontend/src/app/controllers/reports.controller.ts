import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReportRowDto } from '../models/api.types';
import { ReportsService } from '../models/reports/reports.service';
import { ReportsView } from '../views/reports/reports.view';

@Component({
  selector: 'app-reports-controller',
  standalone: true,
  imports: [ReportsView],
  template: `
    <app-reports-view
      [rows]="rows()"
      [total]="total()"
      [loading]="loading()"
      [error]="error()"
    />
  `,
})
export class ReportsController implements OnInit {
  private readonly reports = inject(ReportsService);

  readonly rows = signal<ReportRowDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly total = computed(() =>
    this.rows().reduce((sum, row) => sum + row.totalRegistered, 0),
  );

  ngOnInit(): void {
    this.reports.summary().subscribe({
      next: (response) => {
        this.rows.set(response.data);
        this.loading.set(false);
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo cargar el reporte');
        this.loading.set(false);
      },
    });
  }
}
