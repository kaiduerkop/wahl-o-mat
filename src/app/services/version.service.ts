import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface Version {
  tag: string | null;
  commit: string | null;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  private http = inject(HttpClient);

  readonly version$: Observable<Version> = this.http
    .get<Version>('/api/version')
    .pipe(
      catchError(() => of({ tag: null, commit: null, version: 'unknown' })),
      shareReplay(1),
    );
}
