import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardStatsDto, EventDto, UserDto } from '../../models/api.types';
import { PageHeaderView, StatCardView, statsFromDto } from '../shared/ui.view';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [RouterLink, PageHeaderView, StatCardView],
  templateUrl: './dashboard.view.html',
  styleUrl: './dashboard.view.scss',
})
export class DashboardView {
  readonly user = input.required<UserDto | null>();
  readonly stats = input<DashboardStatsDto | null>(null);
  readonly event = input<EventDto | null>(null);
  readonly error = input<string | null>(null);

  readonly cards = statsFromDto(null);

  cardsFor(stats: DashboardStatsDto | null) {
    return statsFromDto(stats);
  }

  canSee(roles: string[]): boolean {
    const role = this.user()?.role ?? '';
    return roles.includes(role);
  }

  firstName(): string {
    return this.user()?.fullName.split(' ')[0] ?? 'siervo';
  }

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
