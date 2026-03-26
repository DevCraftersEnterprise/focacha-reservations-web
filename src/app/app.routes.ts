import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/auth-shell/auth-shell.component').then(m => m.AuthShellComponent),
        children: [
            {
                path: 'login',
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
                loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'reservations',
                loadComponent: () => import('./features/reservations/pages/reservations/reservations.component').then(m => m.ReservationsComponent)
            },
            {
                path: 'branches',
                loadComponent: () => import('./features/branches/pages/branches/branches.component').then(m => m.BranchesComponent)
            },
            {
                path: 'zones',
                loadComponent: () => import('./features/zones/pages/zones/zones.component').then(m => m.ZonesComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/pages/users/users.component').then(m => m.UsersComponent)
            },
        ]
    },
    {
        path: '**',
        redirectTo: 'login',
    }
];
