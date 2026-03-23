import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { AnswersService } from '../../services/answers.service';
import { PartyResult } from '../../models/config.model';

@Component({
  selector: 'app-results',
  imports: [],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results implements OnInit {
  results: PartyResult[] = [];
  topScore = 0;

  constructor(
    private configService: ConfigService,
    private answersService: AnswersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe(config => {
      this.results = this.answersService.calculateResults(config);
      this.topScore = this.results[0]?.score ?? 0;
    });
  }

  restart(): void {
    this.answersService.reset();
    this.router.navigate(['/']);
  }
}
