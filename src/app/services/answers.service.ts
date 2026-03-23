import { Injectable } from '@angular/core';
import { Answer, UserAnswer, PartyResult, Config } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class AnswersService {
  private answers: Map<string, Answer> = new Map();

  setAnswer(questionId: string, answer: Answer): void {
    this.answers.set(questionId, answer);
  }

  getAnswer(questionId: string): Answer | undefined {
    return this.answers.get(questionId);
  }

  reset(): void {
    this.answers.clear();
  }

  calculateResults(config: Config): PartyResult[] {
    const results: PartyResult[] = config.parties.map(party => {
      let matches = 0;
      let total = 0;

      for (const question of config.questions) {
        const answer = this.answers.get(question.id);
        if (answer === null || answer === undefined) continue; // skipped

        const position = question.positions[party.id] ?? 0;
        total++;

        if (answer === position) {
          matches += 2;
        } else if (answer === 0 || position === 0) {
          matches += 1;
        }
        // full mismatch (e.g. 1 vs -1): 0 points
      }

      const maxPoints = total * 2;
      const score = maxPoints > 0 ? Math.round((matches / maxPoints) * 100) : 0;

      return { party, score, matches, total };
    });

    return results.sort((a, b) => b.score - a.score);
  }
}
