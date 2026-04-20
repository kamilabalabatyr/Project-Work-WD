import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  role: string;
}

// sessionStorage is used intentionally: it is tab-isolated, so multiple
// accounts open in different tabs do not overwrite each other's sessions.
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, credentials);
  }

  register(data: { username: string; email: string; password: string; password2: string; role: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register/`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout/`, {});
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUsername(): string | null {
    return sessionStorage.getItem('username');
  }

  getRole(): string {
    return sessionStorage.getItem('role') ?? 'guest';
  }

  isLandlord(): boolean {
    return this.getRole() === 'landlord';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  saveSession(res: LoginResponse): void {
    sessionStorage.setItem('token', res.token);
    sessionStorage.setItem('username', res.username);
    sessionStorage.setItem('role', res.role);
  }

  clearToken(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
  }
}
