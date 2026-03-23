export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  positions: Record<string, number>; // partyId -> 1 (agree), 0 (neutral), -1 (disagree)
}

export interface Config {
  title: string;
  description: string;
  parties: Party[];
  questions: Question[];
}

export type Answer = 1 | 0 | -1 | null; // agree, neutral, disagree, skipped

export interface UserAnswer {
  questionId: string;
  answer: Answer;
}

export interface PartyResult {
  party: Party;
  score: number; // 0-100
  matches: number;
  total: number;
}
