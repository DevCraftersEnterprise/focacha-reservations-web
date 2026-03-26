import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BranchItem, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.models';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;


  findAll(): Observable<BranchItem[]> {
    return this.http.get<BranchItem[]>(`${this.apiUrl}/branches`);
  }

  findOne(id: string): Observable<BranchItem> {
    return this.http.get<BranchItem>(`${this.apiUrl}/branches/${id}`);
  }

  create(payload: CreateBranchRequest): Observable<BranchItem> {
    return this.http.post<BranchItem>(`${this.apiUrl}/branches`, payload);
  }

  update(id: string, payload: UpdateBranchRequest): Observable<BranchItem> {
    return this.http.patch<BranchItem>(`${this.apiUrl}/branches/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/branches/${id}`);
  }

  restore(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/branches/${id}/restore`, {});
  }
}
