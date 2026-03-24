import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Config } from '../../models/config.model';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  config: Config | null = null;
  loading = true;
  saveStatus: 'idle' | 'saving' | 'ok' | 'error' = 'idle';

  // Password change
  showPwForm = false;
  pwCurrent = '';
  pwNew = '';
  pwConfirm = '';
  pwStatus: 'idle' | 'saving' | 'ok' | 'error' = 'idle';
  pwError = '';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.adminService.getConfig().subscribe({
      next: (config) => {
        this.config = JSON.parse(JSON.stringify(config));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  // ── Parties ────────────────────────────────────────────────────────────────

  addParty(): void {
    if (!this.config) return;
    const id = `party_${Date.now()}`;
    this.config.parties.push({ id, name: '', shortName: '', color: '#888888' });
    for (const q of this.config.questions) {
      q.positions[id] = 0;
    }
  }

  removeParty(index: number): void {
    if (!this.config) return;
    const id = this.config.parties[index].id;
    this.config.parties.splice(index, 1);
    for (const q of this.config.questions) {
      delete q.positions[id];
    }
  }

  updatePartyId(index: number, oldId: string, newId: string): void {
    if (!this.config || oldId === newId || !newId.trim()) return;
    const trimmed = newId.trim();
    this.config.parties[index].id = trimmed;
    for (const q of this.config.questions) {
      if (oldId in q.positions) {
        q.positions[trimmed] = q.positions[oldId];
        delete q.positions[oldId];
      }
    }
  }

  // ── Questions ──────────────────────────────────────────────────────────────

  addQuestion(): void {
    if (!this.config) return;
    const positions: Record<string, number> = {};
    for (const p of this.config.parties) positions[p.id] = 0;
    this.config.questions.push({
      id: `q_${Date.now()}`,
      text: '',
      category: '',
      positions,
    });
  }

  removeQuestion(index: number): void {
    this.config?.questions.splice(index, 1);
  }

  // ── Save config ────────────────────────────────────────────────────────────

  save(): void {
    if (!this.config) return;
    this.saveStatus = 'saving';
    this.adminService.saveConfig(this.config).subscribe({
      next: () => {
        this.saveStatus = 'ok';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.saveStatus = 'idle';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.saveStatus = 'error';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.saveStatus = 'idle';
          this.cdr.detectChanges();
        }, 4000);
      },
    });
  }

  // ── Change password ────────────────────────────────────────────────────────

  changePassword(): void {
    this.pwError = '';
    if (this.pwNew !== this.pwConfirm) {
      this.pwError = 'Neue Passwörter stimmen nicht überein.';
      return;
    }
    if (this.pwNew.length < 8) {
      this.pwError = 'Neues Passwort muss mindestens 8 Zeichen haben.';
      return;
    }
    this.pwStatus = 'saving';
    this.authService.changePassword(this.pwCurrent, this.pwNew).subscribe({
      next: () => {
        this.pwStatus = 'ok';
        this.pwCurrent = this.pwNew = this.pwConfirm = '';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.pwStatus = 'idle';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (e) => {
        this.pwError = e.error?.error ?? 'Fehler beim Ändern des Passworts.';
        this.pwStatus = 'error';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.pwStatus = 'idle';
          this.cdr.detectChanges();
        }, 4000);
      },
    });
  }
}
