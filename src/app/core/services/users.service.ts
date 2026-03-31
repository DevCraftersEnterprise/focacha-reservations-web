import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateUserRequest, UpdateUserRequest, UserItem } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  findAll(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(`${this.apiUrl}/users`);
  }

  findOne(id: string): Observable<UserItem> {
    return this.http.get<UserItem>(`${this.apiUrl}/users/${id}`);
  }

  create(payload: CreateUserRequest): Observable<UserItem> {
    try {
      return this.http.post<UserItem>(`${this.apiUrl}/users`, payload);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  update(id: string, payload: UpdateUserRequest): Observable<UserItem> {
    return this.http.patch<UserItem>(`${this.apiUrl}/users/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  restore(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${id}/restore`, {});
  }
}
