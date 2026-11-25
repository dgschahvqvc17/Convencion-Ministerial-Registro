import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShellView } from '../views/shell/shell.view';
import { AuthStore } from '../models/auth/auth.store';

@Component({
  selector: 'app-shell-controller',
  standalone: true,
  imports: [ShellView],
  template: `
    <app-shell-view [user]="store.user()" (logout)="onLogout()" />
  `,
})
export class ShellController {
  readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  onLogout(): void {
    this.store.logout();
    void this.router.navigate(['/login']);
  }
}
