import { Chestionar } from "./chestionar";

export interface Session {
  created_at: string;
  chestionare: [Chestionar];
  correct_answers: number;
  wrong_answers: number;
}
