import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CancelReservationRequest, CreateReservationRequest, ReservationFilters, ReservationItem, UpdateReservationRequest } from '../models/reservation.models';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  findAll(filters?: ReservationFilters): Observable<ReservationItem[]> {
    let params = new HttpParams();

    if (filters?.branchId) params = params.set('branchId', filters.branchId);
    if (filters?.reservationDate) params = params.set('reservationDate', filters.reservationDate);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<ReservationItem[]>(`${this.apiUrl}/reservations`, { params });
  }

  findOne(id: string): Observable<ReservationItem> {
    return this.http.get<ReservationItem>(`${this.apiUrl}/reservations/${id}`);
  }

  findDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reservations/${id}/document`, { responseType: 'blob' });
  }

  create(payload: CreateReservationRequest): Observable<ReservationItem> {
    return this.http.post<ReservationItem>(`${this.apiUrl}/reservations`, payload);
  }

  update(id: string, payload: UpdateReservationRequest): Observable<ReservationItem> {
    return this.http.patch<ReservationItem>(`${this.apiUrl}/reservations/${id}`, payload);
  }

  cancel(id: string, payload: CancelReservationRequest): Observable<ReservationItem> {
    return this.http.patch<ReservationItem>(`${this.apiUrl}/reservations/${id}/cancel`, payload);
  }

}
