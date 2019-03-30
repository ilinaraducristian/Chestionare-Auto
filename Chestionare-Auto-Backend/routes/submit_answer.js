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
  if (request.body.chestionar_index === undefined)
    return Promise.reject(new Error("chestionar_index is missing"));
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
  return_object.session.chestionare.splice(request.body.chestionar_index, 1);

  function return_status() {
    return Promise.resolve(return_object.status);
  }

  if (return_object.status == "failed" || return_object.status == "passed") {
    return return_object.session.remove().then(return_status);
  } else if (return_object.status == "correct") {
    return_object.session.correct_answers++;
    return return_object.session.save().then(return_status);
  } else if (return_object.status == "wrong") {
    return_object.session.wrong_answers++;
    return return_object.session.save().then(return_status);
  }
}
