import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = '/api/auth/login';
  private readonly changePwUrl = '/api/auth/change-password';
  private readonly TOKEN_KEY = 'admin_token';

  constructor(private http: HttpClient) {}

  login(password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(this.loginUrl, { password })
      .pipe(tap(({ token }) => sessionStorage.setItem(this.TOKEN_KEY, token)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(this.changePwUrl, { currentPassword, newPassword });
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
