import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ReservationCalendarItem, ReservationDayDetailResponse } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCalendarSummary(
    branchId: string,
    month: number,
    year: number
  ): Observable<ReservationCalendarItem[]> {
    const params = new HttpParams()
      .set('branchId', branchId)
      .set('month', month)
      .set('year', year);

    return this.http.get<ReservationCalendarItem[]>(
      `${this.apiUrl}/reservations/calendar/summary`,
      { params }
    );
  }

  getDayDetail(
    branchId: string,
    date: string,
  ): Observable<ReservationDayDetailResponse> {
    const params = new HttpParams()
      .set('branchId', branchId)
      .set('date', date);

    return this.http.get<ReservationDayDetailResponse>(
      `${this.apiUrl}/reservations/day-detail`,
      { params }
    );
  }
}
