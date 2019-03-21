const mongoose = require("mongoose");
const session_schema = require("../schemas/session");
const chestionar_schema = require("../schemas/chestionar");

let Session = (module.exports = mongoose.model("Session", session_schema));

function get_chestionare(category) {
  mongoose
    .model(category, chestionar_schema, category)
    .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
    .exec((err, result) => {
      return result;
    });
}

Session.get_session = function(id) {
  Session.findById(id).exec((err, res) => {
    if (err || !res) return Promise.reject("cannot get session");
    return Promise.resolve(res);
  });
};

Session.new_session = function(category) {
  let chestionare = get_chestionare(category);
  if (!chestionare) return Promise.reject(new Error("cannot make session"));
  let new_session = {
    created_at: new Date(),
    chestionare,
    correct_answers: 0,
    wrong_answers: 0
  };
  return new Session(new_session).save();
};

// nu stiu daca merge
Session.isExpired = function() {
  let now = new Date();
};
// nu stiu daca merge
