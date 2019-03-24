const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");

router.post("/", handleRequest);

function handleRequest(request, response) {
  verify_input(request)
    .then(id => Session.validate_answers(id, request))
    .then(return_object => prepare_response(return_object, request))
    .then(status => response.json({ status }))
    .catch(error => response.json({ error: error.message }));
}

function verify_input(request) {
  if (request.body.question_index === undefined)
    return Promise.reject(new Error("question_index is missing"));
  if (request.body.answers === undefined)
    return Promise.reject(new Error("answers is missing"));
  if (request.body.token === undefined)
    return Promise.reject(new Error("token is missing"));
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(request.body.token, config.secret, (error, id) => {
      if (error) reject(error);
      else resolve(id);
    });
  });
}

function prepare_response(return_object, request) {
  return new Promise((resolve, reject) => {
    return_object.session.chestionare.splice(request.body.question_index, 1);
    if (return_object.status == "wrong") {
      return_object.session.wrong_answers++;
      return_object.session.save(err => {
        if (err) return reject(new Error("cannot save session"));
        resolve(return_object.status);
      });
    } else if (return_object.status == "correct") {
      return_object.session.correct_answers++;
      return_object.session.save(err => {
        if (err) return reject(new Error("cannot save session"));
        resolve(return_object.status);
      });
    } else {
      return_object.session.remove(err => {
        if (err) return reject(new Error("cannot remove session"));
        resolve(return_object.status);
      });
    }
  });
}
