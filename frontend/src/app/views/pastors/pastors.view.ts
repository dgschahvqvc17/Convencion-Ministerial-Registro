import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChurchDto, PastorDto } from '../../models/api.types';
import { PageHeaderView, StateBlockView } from '../shared/ui.view';

@Component({
  selector: 'app-pastors-view',
  standalone: true,
  imports: [FormsModule, PageHeaderView, StateBlockView],
  templateUrl: './pastors.view.html',
  styleUrl: './pastors.view.scss',
})
export class PastorsView {
  readonly pastors = input<PastorDto[]>([]);
  readonly churches = input<ChurchDto[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly create = output<{ churchId: string | null; firstName: string; lastName: string }>();
  readonly remove = output<string>();

  firstName = '';
  lastName = '';
  churchId = '';
  search = '';

  submit(): void {
    if (this.firstName.trim().length < 2 || this.lastName.trim().length < 2) return;
    this.create.emit({
      churchId: this.churchId || null,
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    });
    this.firstName = '';
    this.lastName = '';
  }

  filtered(): PastorDto[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.pastors();
    return this.pastors().filter((pastor) =>
      `${pastor.firstName} ${pastor.lastName}`.toLowerCase().includes(term),
    );
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
