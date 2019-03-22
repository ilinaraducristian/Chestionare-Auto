const mongoose = require("mongoose");
const session_schema = require("../schemas/session");
const chestionar_schema = require("../schemas/chestionar");
let Session = mongoose.model("Session", session_schema);

module.exports = {
  new: function(category) {
    return mongoose
      .model(category, chestionar_schema, category)
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec()
      .then(chestionare => {
        if (!chestionare)
          return Promise.reject(new Error("cannot get chestionare"));
        return new Session({
          created_at: new Date(),
          chestionare,
          correct_answers: 0,
          wrong_answers: 0
        }).save();
      });
  },
  get: function(id) {
    let return_object = { status: "ok" };
    Session.findById(id)
      .exec()
      .then(session => {
        if (!session) return Promise.reject("cannot get session");
        let now = new Date();
        if (now.getTime() > session.created_at.getTime() + 1800000) {
          // if time expired
          if (session.correct_answers > 21) {
            return_object.ok = "passed";
          } else {
            return_object.ok = "failed";
          }
        } else {
          // if not
          if (session.wrong_answers > 4) {
            return_object.ok = "failed";
          } else if (session.correct_answers + session.wrong_answers > 25) {
            return_object.ok = "passed";
          } else {
            return_object.session = session;
          }
        }
        return Promise.resolve(return_object);
      });
  }
};
