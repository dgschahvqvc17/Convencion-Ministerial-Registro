import { Component, OnInit, inject, signal } from '@angular/core';
import { RoleName, UserDto } from '../models/api.types';
import { ReportsService } from '../models/reports/reports.service';
import { UsersView } from '../views/users/users.view';

@Component({
  selector: 'app-users-controller',
  standalone: true,
  imports: [UsersView],
  template: `
    <app-users-view
      [users]="users()"
      [loading]="loading()"
      [error]="error()"
      (createUser)="onCreate($event)"
      (changeRole)="onRole($event)"
      (toggleActive)="onToggle($event)"
    />
  `,
})
export class UsersController implements OnInit {
  private readonly reports = inject(ReportsService);

  readonly users = signal<UserDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.reports.users().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.loading.set(false);
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo cargar los usuarios');
        this.loading.set(false);
      },
    });
  }

  onCreate(body: { email: string; password: string; fullName: string; role: RoleName }): void {
    this.reports.createUser(body).subscribe({
      next: (response) => this.users.update((list) => [...list, response.data]),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }

  onRole(event: { id: string; role: RoleName }): void {
    this.reports.assignRole(event.id, event.role).subscribe({
      next: (response) =>
        this.users.update((list) =>
          list.map((user) => (user.id === event.id ? response.data : user)),
        ),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }

  onToggle(event: { id: string; isActive: boolean }): void {
    this.reports.setActive(event.id, event.isActive).subscribe({
      next: (response) =>
        this.users.update((list) =>
          list.map((user) => (user.id === event.id ? response.data : user)),
        ),
      error: (failure: { message?: string }) => this.error.set(failure.message ?? null),
    });
  }
}
