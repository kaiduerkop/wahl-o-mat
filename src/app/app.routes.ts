import { Routes } from '@angular/router';
import { Start } from './components/start/start';
import { Question } from './components/question/question';
import { Results } from './components/results/results';

export const routes: Routes = [
  { path: '', component: Start },
  { path: 'frage/:index', component: Question },
  { path: 'ergebnis', component: Results },
  { path: '**', redirectTo: '' },
];
