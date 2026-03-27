import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateZoneRequest, UpdateZoneRequest, ZoneItem } from '../models/zone.models';

@Injectable({
  providedIn: 'root'
})
export class ZonesService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  findAll(): Observable<ZoneItem[]> {
    return this.http.get<ZoneItem[]>(`${this.apiUrl}/zones`);
  }

  findOne(id: string): Observable<ZoneItem> {
    return this.http.get<ZoneItem>(`${this.apiUrl}/zones/${id}`);
  }

  findByBranchId(branchId: string): Observable<ZoneItem[]> {
    return this.http.get<ZoneItem[]>(`${this.apiUrl}/zones/branch/${branchId}`);
  }

  create(payload: CreateZoneRequest): Observable<ZoneItem> {
    return this.http.post<ZoneItem>(`${this.apiUrl}/zones`, payload);
  }

  update(id: string, payload: UpdateZoneRequest): Observable<ZoneItem> {
    return this.http.patch<ZoneItem>(`${this.apiUrl}/zones/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/zones/${id}`);
  }

  restore(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/zones/${id}/restore`, {});
  }

}
