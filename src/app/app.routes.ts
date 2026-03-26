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
        loadComponent: () => import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
        children: [
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login',
    }
];
