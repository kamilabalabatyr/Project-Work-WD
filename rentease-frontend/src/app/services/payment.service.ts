import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPaymentRequest, IPaymentResponse } from '../interfaces/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  process(data: IPaymentRequest): Observable<IPaymentResponse> {
    return this.http.post<IPaymentResponse>(`${this.apiUrl}/payments/`, data);
  }
}
