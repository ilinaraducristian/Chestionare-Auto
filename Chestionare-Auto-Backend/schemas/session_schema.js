const mongoose = require("mongoose");
const question_schema = require("./question_schema");

module.exports = new mongoose.Schema(
  {
    created_at: Date,
    questions: [question_schema],
    correct_answers: Number,
    wrong_answers: Number
  },
  {
    versionKey: false
  }
);
