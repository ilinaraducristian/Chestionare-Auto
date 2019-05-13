import { Schema } from 'mongoose';
import { ChestionarSchema } from './chestionar.schema';
export const SessionSchema = new Schema(
  {
    created_at: Date,
    chestionare: [ChestionarSchema],
    correct_answers: Number,
    wrong_answers: Number,
  },
  {
    versionKey: false,
  },
);
