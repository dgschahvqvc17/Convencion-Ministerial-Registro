import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './routes/app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { AuthStore } from './models/auth/auth.store';

function initializeAuth(): () => Promise<void> {
  const store = inject(AuthStore);
  return () => firstValueFrom(store.initialize());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
    },
  ],
};
