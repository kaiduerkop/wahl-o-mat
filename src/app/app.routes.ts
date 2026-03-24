import { Routes } from '@angular/router';
import { Start } from './components/start/start';
import { Question } from './components/question/question';
import { Results } from './components/results/results';
import { Impressum } from './components/imprint/imprint';
import { Datenschutz } from './components/privacy/privacy';
import { Admin } from './components/admin/admin';
import { AdminLogin } from './components/admin-login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Start },
  { path: 'question/:index', component: Question },
  { path: 'results', component: Results },
  { path: 'imprint', component: Impressum },
  { path: 'privacy', component: Datenschutz },
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
