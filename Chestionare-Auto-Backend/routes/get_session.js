const router = (module.exports = require("express").Router());
const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");
const Session = require("../models/Session");

router.post("/", handleRequest);

function handleRequest(request, response) {
  verify_input(request.body.token)
    .then(id => Session.get(id))
    .then(return_object => prepare_response(return_object))
    .then(res => response.json(res))
    .catch(error => response.json({ error: error.message }));
}

function verify_input(token) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, config.secret, (error, id) => {
      if (error) reject(error);
      else resolve(id);
    });
  });
}

function prepare_response(return_object) {
  return new Promise((resolve, reject) => {
    if (return_object.status == "ok") {
      return_object.session = return_object.session.toObject();
      delete return_object.session._id;
      return_object.session.chestionare.map(chestionar => {
        delete chestionar.correct_answers;
        return chestionar;
      });
      return_object.now = new Date();
      return resolve(return_object);
    }
    return_object.session.remove(err => {
      if (err) return reject(new Error("cannot remove session"));
      resolve(return_object);
    });
  });
}
