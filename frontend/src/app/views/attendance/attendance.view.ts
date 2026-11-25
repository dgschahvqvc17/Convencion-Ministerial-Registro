import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceDto, EventDto, PastorDto } from '../../models/api.types';
import { PageHeaderView, StateBlockView } from '../shared/ui.view';

@Component({
  selector: 'app-attendance-view',
  standalone: true,
  imports: [FormsModule, PageHeaderView, StateBlockView],
  templateUrl: './attendance.view.html',
  styleUrl: './attendance.view.scss',
})
export class AttendanceView {
  readonly pastors = input<PastorDto[]>([]);
  readonly events = input<EventDto[]>([]);
  readonly records = input<AttendanceDto[]>([]);
  readonly loading = input(false);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);

  readonly register = output<{ eventId: string; pastorId: string; notes: string }>();
  readonly cancel = output<string>();
  readonly search = output<string>();

  eventId = '';
  pastorId = '';
  notes = '';
  term = '';

  submit(): void {
    if (!this.eventId || !this.pastorId) return;
    this.register.emit({
      eventId: this.eventId,
      pastorId: this.pastorId,
      notes: this.notes.trim(),
    });
    this.pastorId = '';
    this.notes = '';
  }

  onSearch(): void {
    this.search.emit(this.term.trim());
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
