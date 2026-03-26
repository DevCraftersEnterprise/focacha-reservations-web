import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.models';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';

  private readonly _token = signal<string | null>(localStorage.getItem(this.tokenKey));
  private readonly _user = signal<AuthUser | null>(this.getStoredUser());
  private readonly _isBootstrapping = signal<boolean>(false);

  readonly token = computed(() => this._token());
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isCashier = computed(() => this._user()?.role === 'CASHIER');

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => {
        this.setSession(response.accessToken, response.user);
      }));
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/auth/me`);
  }

  bootstrapSession(): Observable<boolean> {
    const token = this._token();

    if (!token) {
      this.clearSession(false);
      return of(false);
    }

    this._isBootstrapping.set(true);

    return this.me().pipe(
      tap((user) => {
        this.setSession(token, user);
      }),
      map(() => true),
      catchError(() => {
        this.clearSession(false);
        return of(false);
      }),
      tap(() => {
        this._isBootstrapping.set(false);
      })
    );
  }

  logout(): void {
    this.clearSession(true);
  }

  getAccessToken(): string | null {
    return this._token();
  }

  private setSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));

    this._token.set(token);
    this._user.set(user);
  }

  private clearSession(redirectToLogin: boolean): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    this._token.set(null);
    this._user.set(null);

    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

}
