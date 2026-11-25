import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserDto } from '../../models/api.types';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-shell-view',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.view.html',
  styleUrl: './shell.view.scss',
})
export class ShellView {
  readonly user = input.required<UserDto | null>();
  readonly logout = output<void>();

  readonly items: NavItem[] = [
    { path: '/dashboard', label: 'Panel', icon: '◈', roles: [] },
    { path: '/estructura', label: 'Estructura', icon: '◇', roles: ['admin'] },
    { path: '/pastores', label: 'Pastores', icon: '✝', roles: ['admin', 'operator'] },
    { path: '/asistencia', label: 'Asistencia', icon: '✓', roles: ['admin', 'operator'] },
    { path: '/reportes', label: 'Reportes', icon: '▤', roles: [] },
    { path: '/usuarios', label: 'Usuarios', icon: '⚙', roles: ['admin'] },
  ];

  visible(item: NavItem): boolean {
    const role = this.user()?.role ?? '';
    return item.roles.length === 0 || item.roles.includes(role);
  }

  initials(): string {
    const name = this.user()?.fullName ?? '?';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  roleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      operator: 'Registro',
      pastor: 'Pastor',
      viewer: 'Consultor',
    };
    const role = this.user()?.role ?? '';
    return labels[role] ?? role;
  }
}
