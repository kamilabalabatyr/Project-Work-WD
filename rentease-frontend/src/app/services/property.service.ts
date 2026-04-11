import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IProperty } from '../interfaces/property.interface';

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

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}/`);
  }
}