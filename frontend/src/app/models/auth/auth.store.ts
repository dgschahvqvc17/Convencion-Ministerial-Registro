import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { UserDto } from '../api.types';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly auth = inject(AuthService);

  private readonly _user = signal<UserDto | null>(null);
  private readonly _loading = signal(false);
  private readonly _ready = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  initialize(): Observable<void> {
    if (this._ready()) {
      return of(void 0);
    }
    this._loading.set(true);
    return this.auth.me().pipe(
      tap((response) => this._user.set(response.data)),
      catchError(() => {
        this._user.set(null);
        return of(null);
      }),
      map(() => void 0),
      finalize(() => {
        this._loading.set(false);
        this._ready.set(true);
      }),
    );
  }

  login(email: string, password: string) {
    this._loading.set(true);
    return this.auth.login(email, password).pipe(
      tap((response) => {
        this._user.set(response.data);
        this._ready.set(true);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  logout(): void {
    this.auth
      .logout()
      .pipe(catchError(() => of(null)))
      .subscribe(() => this._user.set(null));
  }

  can(roles: readonly string[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }
}
