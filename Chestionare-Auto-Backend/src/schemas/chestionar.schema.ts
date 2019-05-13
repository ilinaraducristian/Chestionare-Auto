import { Schema } from 'mongoose';
export const ChestionarSchema = new Schema(
  {
    question: String,
    answers: [String],
    image: String,
    correct_answers: String,
  },
  {
    versionKey: false,
    _id: false,
  },
);
