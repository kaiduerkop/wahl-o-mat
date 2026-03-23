import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="app-footer">
      <div class="app-footer__inner">
        <span class="app-footer__note">Diese Anwendung speichert keine personenbezogenen Daten.</span>
        <nav class="app-footer__links" aria-label="Rechtliche Links">
          <a routerLink="/impressum">Impressum</a>
          <a routerLink="/datenschutz">Datenschutz</a>
        </nav>
      </div>
    </footer>
  `
})
export class Footer {}
