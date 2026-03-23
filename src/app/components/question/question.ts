import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { AnswersService } from '../../services/answers.service';
import { Config, Question as QuestionModel, Answer } from '../../models/config.model';

@Component({
  selector: 'app-question',
  imports: [],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class Question implements OnInit {
  config: Config | null = null;
  current: QuestionModel | null = null;
  index = 0;
  selectedAnswer: Answer | undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private answersService: AnswersService,
  ) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe((config) => {
      this.config = config;
      this.route.paramMap.subscribe((params) => {
        this.index = Number(params.get('index') ?? 0);
        this.current = config.questions[this.index] ?? null;
        this.selectedAnswer = this.answersService.getAnswer(this.current?.id ?? '');
      });
    });
  }

  get progress(): number {
    if (!this.config) return 0;
    return ((this.index + 1) / this.config.questions.length) * 100;
  }

  select(answer: Answer): void {
    this.selectedAnswer = answer;
  }

  next(): void {
    if (!this.config || !this.current) return;
    this.answersService.setAnswer(this.current.id, this.selectedAnswer ?? null);
    this.navigate(this.index + 1);
  }

  skip(): void {
    if (!this.config || !this.current) return;
    this.answersService.setAnswer(this.current.id, null);
    this.navigate(this.index + 1);
  }

  back(): void {
    this.navigate(this.index - 1);
  }

  private navigate(idx: number): void {
    if (!this.config) return;
    if (idx >= this.config.questions.length) {
      this.router.navigate(['/results']);
    } else if (idx < 0) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/question', idx]);
    }
  }
}
