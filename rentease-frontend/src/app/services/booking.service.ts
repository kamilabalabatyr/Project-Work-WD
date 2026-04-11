import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IBooking } from '../interfaces/booking.interface';
import { PaginatedResponse } from './property.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  create(data: Partial<IBooking>): Observable<IBooking> {
    return this.http.post<IBooking>(`${this.apiUrl}/bookings/`, data);
  }

  getMyBookings(): Observable<IBooking[]> {
    return this.http.get<PaginatedResponse<IBooking>>(`${this.apiUrl}/bookings/`).pipe(
      map(res => res.results)
    );
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bookings/${id}/`);
  }
}