import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BranchItem } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;


  findAll(): Observable<BranchItem[]> {
    return this.http.get<BranchItem[]>(`${this.apiUrl}/branches`);
  }
}
