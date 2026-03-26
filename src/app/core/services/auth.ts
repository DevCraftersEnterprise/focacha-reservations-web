import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';

  private readonly _token = signal<string | null>(localStorage.getItem(this.tokenKey));
  private readonly _user = signal<AuthUser | null>(this.getStoredUser());

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
        this.setSession(response);
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    this._token.set(null);
    this._user.set(null);

    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this._token();
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));

    this._token.set(response.accessToken);
    this._user.set(response.user);
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
