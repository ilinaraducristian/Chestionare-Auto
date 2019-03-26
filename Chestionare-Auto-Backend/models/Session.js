const mongoose = require("mongoose");
const session_schema = require("../schemas/session");
const chestionar_schema = require("../schemas/chestionar");
let Session = mongoose.model("Session", session_schema);

module.exports = {
  /**
   * @param  {string} category
   * @returns {Promise<Object>} mongose save promise
   */
  new: function(category) {
    return mongoose
      .model(category, chestionar_schema, category)
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
      .exec()
      .then(
        chestionare =>
          new Promise((resolve, reject) => {
            if (!chestionare)
              return reject(new Error("cannot get chestionare"));
            new Session({
              created_at: new Date(),
              chestionare,
              correct_answers: 0,
              wrong_answers: 0
            }).save((err, session) => {
              if (err || !session)
                return reject(new Error("cannot get session"));
              resolve(session);
            });
          })
      );
  },
  /**
   * @param  {string} id ObjectID stored in DB
   * @returns {Promise<Object>} returne_object { status: "passed | failed | ok" }
   */
  get: function(id) {
    return Session.findById(id)
      .exec()
      .then(
        session =>
          new Promise((resolve, reject) => {
            if (!session) return reject(new Error("cannot get session"));
            let now = new Date();
            let return_object = { session, status: "ok" };
            if (now.getTime() > session.created_at.getTime() + 1800000) {
              // if time expired
              return_object.status =
                session.correct_answers > 21 ? "passed" : "failed";
            } else if (session.wrong_answers > 4) {
              return_object.status = "failed";
            } else if (session.correct_answers + session.wrong_answers > 25) {
              return_object.status = "passed";
            }
            resolve(return_object);
          })
      );
  },
  /**
   * @param  {string} id ObjectID stored in DB
   * @param  {[string]} answers Answers submitted by the user
   * @returns {Promise<string>} return_object { status: "passed | failed | correct | wrong" }
   */
  validate_answers: function(id, request) {
    return this.get(id).then(
      return_object =>
        new Promise((resolve, reject) => {
          if (return_object.status != "ok") return resolve(return_object);
          let chestionar =
            return_object.session.chestionare[request.body.question_index];
          if (!chestionar) return reject(new Error("chestionar not found"));
          if (request.body.answers == chestionar.correct_answers) {
            return_object.status = "correct";
            if (
              return_object.session.correct_answers +
                1 +
                return_object.session.wrong_answers >
              25
            )
              return_object.status = "passed";
          } else {
            return_object.status = "wrong";
            if (return_object.session.wrong_answers + 1 > 4)
              return_object.status = "failed";
          }
          resolve(return_object);
        })
    );
  }
};
