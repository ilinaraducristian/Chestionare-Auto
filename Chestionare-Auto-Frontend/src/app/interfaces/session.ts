import { Question } from "./question";

export interface Session {
  now: Date;
  created_at: Date;
  questions: [Question];
  correct_answers: Number;
  wrong_answers: Number;
}
