import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoleName, UserDto } from '../../models/api.types';
import { PageHeaderView, StateBlockView } from '../shared/ui.view';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [FormsModule, PageHeaderView, StateBlockView],
  templateUrl: './users.view.html',
  styleUrl: './users.view.scss',
})
export class UsersView {
  readonly users = input<UserDto[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly createUser = output<{
    email: string;
    password: string;
    fullName: string;
    role: RoleName;
  }>();
  readonly changeRole = output<{ id: string; role: RoleName }>();
  readonly toggleActive = output<{ id: string; isActive: boolean }>();

  readonly roles: RoleName[] = ['admin', 'operator', 'pastor', 'viewer'];

  email = '';
  password = '';
  fullName = '';
  role: RoleName = 'operator';

  submit(): void {
    if (!this.email || this.password.length < 6 || this.fullName.length < 3) return;
    this.createUser.emit({
      email: this.email.trim(),
      password: this.password,
      fullName: this.fullName.trim(),
      role: this.role,
    });
    this.email = '';
    this.password = '';
    this.fullName = '';
  }

  roleLabel(role: RoleName | null): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      operator: 'Registro',
      pastor: 'Pastor',
      viewer: 'Consultor',
    };
    return role ? (labels[role] ?? role) : 'Sin asignar';
  }
}
