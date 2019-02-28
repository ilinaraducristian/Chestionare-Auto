const mongoose = require("mongoose");
const chestionar_schema = require("./chestionar");

module.exports = new mongoose.Schema(
  {
    created_at: Date,
    questions: [chestionar_schema],
    correct_answers: Number,
    wrong_answers: Number
  },
  {
    versionKey: false
  }
);
