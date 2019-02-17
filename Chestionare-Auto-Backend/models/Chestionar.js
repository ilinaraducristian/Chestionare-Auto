const mongoose = require("mongoose");
const question_schema = require("../schemas/question_schema");

module.exports = function(category) {
  let chestionar_model = mongoose.model(category, question_schema, category);
  chestionar_model.new = function() {
    return chestionar_model
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec();
  };
  return chestionar_model;
};
