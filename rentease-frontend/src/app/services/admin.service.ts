import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProperty } from '../interfaces/property.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin/properties';

  constructor(private http: HttpClient) {}

  getPendingProperties(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(`${this.apiUrl}/pending/`);
  }

  getApprovedProperties(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(`${this.apiUrl}/approved/`);
  }

  approveProperty(id: number): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.apiUrl}/${id}/approval/`, { action: 'approve' });
  }

  rejectProperty(id: number, reason: string): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.apiUrl}/${id}/approval/`, { action: 'reject', rejection_reason: reason });
  }

  getInactiveProperties(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(`${this.apiUrl}/inactive/`);
  }

  deactivateProperty(id: number): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.apiUrl}/${id}/deactivate/`, {});
  }

  reactivateProperty(id: number): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.apiUrl}/${id}/reactivate/`, {});
  }
}
