const mongoose = require("mongoose");

module.exports = new mongoose.Schema(
  {
    question: String,
    answers: [String],
    image: String,
    correct_answers: String
  },
  {
    versionKey: false,
    _id: false
  }
);
