import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProperty } from '../interfaces/property.interface';
import { IBooking } from '../interfaces/booking.interface';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getAll(page: number = 1): Observable<PaginatedResponse<IProperty>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PaginatedResponse<IProperty>>(`${this.apiUrl}/properties/`, { params });
  }

  getById(id: number): Observable<IProperty> {
    return this.http.get<IProperty>(`${this.apiUrl}/properties/${id}/`);
  }

  create(data: Partial<IProperty>): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.apiUrl}/properties/`, data);
  }

  update(id: number, data: Partial<IProperty>): Observable<IProperty> {
    return this.http.patch<IProperty>(`${this.apiUrl}/properties/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}/`);
  }

  // Landlord extranet
  getMyProperties(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(`${this.apiUrl}/landlord/properties/`);
  }

  getPropertyBookings(propertyId: number): Observable<IBooking[]> {
    return this.http.get<IBooking[]>(`${this.apiUrl}/landlord/properties/${propertyId}/bookings/`);
  }

  getAllLandlordBookings(): Observable<IBooking[]> {
    return this.http.get<IBooking[]>(`${this.apiUrl}/landlord/bookings/`);
  }
}
