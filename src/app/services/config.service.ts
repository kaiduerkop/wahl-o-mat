import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { Config } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config$: Observable<Config>;

  constructor(private http: HttpClient) {
    this.config$ = this.http.get<Config>('/api/public/config').pipe(
      catchError((err) =>
        throwError(() => new Error(`Failed to load configuration: ${err.message}`)),
      ),
      shareReplay(1),
    );
  }

  getConfig(): Observable<Config> {
    return this.config$;
  }
}
