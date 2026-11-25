import { Component, input } from '@angular/core';
import { ReportRowDto } from '../../models/api.types';
import { PageHeaderView, StateBlockView } from '../shared/ui.view';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [PageHeaderView, StateBlockView],
  templateUrl: './reports.view.html',
  styleUrl: './reports.view.scss',
})
export class ReportsView {
  readonly rows = input<ReportRowDto[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly total = input(0);

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('es-BO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
