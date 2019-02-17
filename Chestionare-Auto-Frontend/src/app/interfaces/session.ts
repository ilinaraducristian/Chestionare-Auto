import { Question } from "./question";

export interface Session {
  now: Date;
  created_at: Date;
  expiration_date: Date;
  questions: [Question];
  correct_answers: 0;
  wrong_answers: 0;
}
