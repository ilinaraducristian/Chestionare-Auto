const mongoose = require("mongoose");

module.exports = new mongoose.Schema(
  {
    question: String,
    image: String,
    answers: [String],
    correct_answers: String
  },
  {
    versionKey: false,
    _id: false
  }
);
