import { Question } from "./question";

export interface Session {
  now: string;
  created_at: string;
  expiration_date: string;
  questions: [Question];
  correct_answers: 0;
  wrong_answers: 0;
}
