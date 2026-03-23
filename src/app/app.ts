import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer],
  template: `
    <div class="app-layout">
      <main class="app-layout__content">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {}
