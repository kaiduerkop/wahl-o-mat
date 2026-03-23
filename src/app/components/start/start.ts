import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-start',
  imports: [],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
  error = signal<string | null>(null);
  config;

  constructor(private configService: ConfigService, private router: Router) {
    this.config = toSignal(
      this.configService.getConfig().pipe(
        catchError(err => {
          this.error.set(err.message);
          return of(null);
        })
      )
    );
  }

  start(): void {
    this.router.navigate(['/frage', 0]);
  }
}
