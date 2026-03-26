import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/auth-shell/auth-shell').then(m => m.AuthShell),
        children: [
            {
                path: 'login',
                canActivate: [guestGuard],
                loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
            },
            { path: '', pathMatch: 'full', redirectTo: 'login' },
        ],
    },
    {
        path: '',
        loadComponent: () => import('./layout/admin-shell/admin-shell').then(m => m.AdminShell),
        children: [
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login',
    }
];
