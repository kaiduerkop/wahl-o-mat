import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class AdminLogin {
  private auth = inject(AuthService);
  private router = inject(Router);

  password = '';
  error = signal<string | null>(null);
  loading = false;

  submit(): void {
    if (!this.password) return;
    this.loading = true;
    this.error.set(null);
    this.auth.login(this.password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => {
        this.error.set('Falsches Passwort');
        this.loading = false;
        this.password = '';
      },
    });
  }
}
