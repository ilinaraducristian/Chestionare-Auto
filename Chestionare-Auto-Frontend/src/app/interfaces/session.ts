import { Chestionar } from "./chestionar";

export interface Session {
  now: Date;
  created_at: Date;
  chestionare: [Chestionar];
  correct_answers: number;
  wrong_answers: number;
}
