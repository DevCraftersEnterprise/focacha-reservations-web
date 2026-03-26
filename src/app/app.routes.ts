import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/auth-shell/auth-shell').then(m => m.AuthShell),
        children: [
            { path: 'login', loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login) },
            { path: '', pathMatch: 'full', redirectTo: 'login' },
        ],
    },
    {
        path: '',
        loadComponent: () => import('./layout/admin-shell/admin-shell').then(m => m.AdminShell),
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard) }
        ]
    },
    {
        path: '**',
        redirectTo: 'login',
    }
];
