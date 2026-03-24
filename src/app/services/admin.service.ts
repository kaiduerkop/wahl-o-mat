import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = '/api/config';

  constructor(private http: HttpClient) {}

  getConfig(): Observable<Config> {
    return this.http.get<Config>(this.apiUrl);
  }

  saveConfig(config: Config): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(this.apiUrl, config);
  }
}
