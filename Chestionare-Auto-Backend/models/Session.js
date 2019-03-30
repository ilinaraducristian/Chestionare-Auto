const mongoose = require("mongoose");
const session_schema = require("../schemas/session");
const chestionar_schema = require("../schemas/chestionar");
let Session = (module.exports = mongoose.model("Session", session_schema));

/**
 * @param {string} category Get chestionare from this category(categoria_a|categoria_b|categoria_c|categoria_d).
 * @returns {Promise<object>} Return new session based on category.
 */
Session.new = function(category) {
  return (
    mongoose
      .model(category, chestionar_schema, category) // Create chestionar model
      .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }]) // Generate 26 chestionare based on category
      .exec() // Return query promise
      // Check if chestionare are valid
      .then(chestionare => {
        if (!chestionare)
          return Promise.reject(new Error("cannot get chestionare"));
        else return Promise.resolve(chestionare);
      })
      // Create new session based on chestionare and save it
      .then(chestionare =>
        new Session({
          created_at: new Date(),
          chestionare,
          correct_answers: 0,
          wrong_answers: 0
        }).save()
      )
      // Check if saved session is valid
      .then(session => {
        if (!session) return Promise.reject(new Error("cannot get session"));
        else return Promise.resolve(session);
      })
  );
};

/**
 * @param  {string} id MongoDB session ObjectID.
 * @returns {Promise<string>} Session passed|failed or return session.
 */
Session.get = function(id) {
  return (
    Session.findById(id) // Find session in MongoDB by id
      .exec() // Return query promise
      // Check if found session is valid
      .then(session => {
        if (!session) return Promise.reject(new Error("cannot get session"));
        else return Promise.resolve(session);
      })
      // Check if session expired
      .then(session => {
        let now = new Date();
        let return_object = { session };
        if (now.getTime() > session.created_at.getTime() + 1800000) {
          // If session expired
          if (session.correct_answers > 21) {
            return_object.status = "passed";
          } else {
            return_object.status = "failed";
          }
        } else {
          // If it didn't
          if (session.wrong_answers > 4) {
            return_object.status = "failed";
          } else if (session.correct_answers + session.wrong_answers > 25) {
            return_object.status = "passed";
          } else {
            return_object.status = "ok";
          }
        }
        return Promise.resolve(return_object);
      })
  );
};

/**
 * @param {string} id MongoDB session ObjectID.
 * @param {object} request Express request parameter.
 * @returns {Promise<object>} Session passed|failed or chestionar correct|wrong.
 */
Session.validate_answers = function(id, request) {
  // Find session in MongoDB by id
  return this.get(id).then(return_object => {
    if (return_object.status != "ok") return Promise.resolve(return_object); // Check if session expired
    let chestionar =
      return_object.session.chestionare[request.body.chestionar_index]; // Find chestionar
    if (!chestionar) return Promise.reject(new Error("chestionar not found")); // Check if chestionar exists
    // Check if answers are correct
    if (request.body.answers == chestionar.correct_answers) {
      if (
        return_object.session.correct_answers +
          1 +
          return_object.session.wrong_answers >
        25
      ) {
        return_object.status = "passed";
      } else {
        return_object.status = "correct";
      }
    } else {
      if (return_object.session.wrong_answers + 1 > 4) {
        return_object.status = "failed";
      } else {
        return_object.status = "wrong";
      }
    }
    return Promise.resolve(return_object);
  });
};
