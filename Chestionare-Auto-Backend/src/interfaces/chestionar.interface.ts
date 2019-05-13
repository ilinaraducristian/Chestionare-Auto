import { Document } from 'mongoose';

export interface Chestionar extends Document {
  question: string;
  answers: string[];
  image: string;
  correct_answers: string;
}
