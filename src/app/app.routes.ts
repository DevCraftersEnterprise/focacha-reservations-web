import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/auth-shell/auth-shell.component').then(m => m.AuthShellComponent),
        children: [
            {
                path: 'login',
                title: 'Iniciar sesión | Sistema de Reservaciones',
                canActivate: [guestGuard],
                loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
            },
            { path: '', pathMatch: 'full', redirectTo: 'login' },
        ],
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
        children: [
            {
                path: 'dashboard',
                title: 'Dashboard | Sistema de Reservaciones',
                loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'reservations',
                title: 'Reservaciones | Sistema de Reservaciones',
                loadComponent: () => import('./features/reservations/pages/reservations/reservations.component').then(m => m.ReservationsComponent)
            },
            {
                path: 'branches',
                title: 'Sucursales | Sistema de Reservaciones',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/branches/pages/branches/branches.component').then(m => m.BranchesComponent)
            },
            {
                path: 'zones',
                title: 'Zonas | Sistema de Reservaciones',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/zones/pages/zones/zones.component').then(m => m.ZonesComponent)
            },
            {
                path: 'users',
                title: 'Usuarios | Sistema de Reservaciones',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/users/pages/users/users.component').then(m => m.UsersComponent)
            },
        ]
    },
    {
        path: '**',
        redirectTo: 'login',
    }
];
