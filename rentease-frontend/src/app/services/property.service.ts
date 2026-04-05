import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProperty } from '../interfaces/property.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IProperty[]> {
    return this.http.get<IProperty[]>(`${this.apiUrl}/properties/`);
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