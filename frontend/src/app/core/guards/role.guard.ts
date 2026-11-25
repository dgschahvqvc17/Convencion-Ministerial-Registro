import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../models/auth/auth.store';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const roles = (route.data['roles'] as string[] | undefined) ?? [];

  if (roles.length === 0 || store.can(roles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
