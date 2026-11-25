import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginPayload, LoginView } from '../views/login/login.view';
import { AuthStore } from '../models/auth/auth.store';

@Component({
  selector: 'app-login-controller',
  standalone: true,
  imports: [LoginView],
  template: `
    <app-login-view
      [loading]="loading()"
      [error]="error()"
      (submitForm)="onSubmit($event)"
    />
  `,
})
export class LoginController {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.store.loading;
  readonly error = signal<string | null>(null);

  onSubmit(payload: LoginPayload): void {
    this.error.set(null);
    this.store.login(payload.email, payload.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        void this.router.navigateByUrl(returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      },
      error: (failure: { message?: string }) => {
        this.error.set(failure.message ?? 'No se pudo iniciar sesión.');
      },
    });
  }
}
