import { Chestionar } from './chestionar.interface';
import { Document } from 'mongoose';

export interface Session extends Document {
  created_at: Date;
  chestionare: Chestionar[];
  correct_answers: number;
  wrong_answers: number;
}
