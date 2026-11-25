import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../controllers/login.controller').then((m) => m.LoginController),
    title: 'Iniciar sesión · 44° Convención Ministerial',
  },
  {
    path: '',
    loadComponent: () => import('../controllers/shell.controller').then((m) => m.ShellController),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../controllers/dashboard.controller').then((m) => m.DashboardController),
        title: 'Panel · 44° Convención Ministerial',
      },
      {
        path: 'estructura',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('../controllers/structure.controller').then((m) => m.StructureController),
        title: 'Estructura · 44° Convención Ministerial',
      },
      {
        path: 'pastores',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'operator'] },
        loadComponent: () =>
          import('../controllers/pastors.controller').then((m) => m.PastorsController),
        title: 'Pastores · 44° Convención Ministerial',
      },
      {
        path: 'asistencia',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'operator'] },
        loadComponent: () =>
          import('../controllers/attendance.controller').then((m) => m.AttendanceController),
        title: 'Asistencia · 44° Convención Ministerial',
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('../controllers/reports.controller').then((m) => m.ReportsController),
        title: 'Reportes · 44° Convención Ministerial',
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('../controllers/users.controller').then((m) => m.UsersController),
        title: 'Usuarios · 44° Convención Ministerial',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
