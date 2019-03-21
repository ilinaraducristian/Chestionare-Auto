const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");

router.post("/", handleRequest);

function handleRequest(request, response) {
  verify_input(request)
    .then(id => Session.findById(id).exec())
    .then(result => verify_if_given_answers_are_correct(result, request.body))
    .then(asd => {
      console.log(asd);
      return asd;
    })
    .then(status => response.json({ status }))
    .catch(error => handleError(error, response));
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

function verify_if_given_answers_are_correct(session, request) {
  if (session === null)
    return Promise.reject(new Error("session does not exist"));

  let chestionar = session.chestionare[request.question_index];

  if (!chestionar) return Promise.reject(new Error("question does not exist"));

  let status = request.answers === chestionar.correct_answers;
  session.chestionare.splice(request.question_index, 1);
  if (status) {
    session.correct_answers++;
  } else {
    session.wrong_answers++;
  }
  let now = new Date();
  if (now.getTime() < session.created_at.getTime() + 1800000) {
    if (session.correct_answers >= 22)
      return session.remove().then(Promise.resolve("passed"));
    return session.remove().then(Promise.resolve("failed"));
  }
  if (session.correct_answers + session.wrong_answers >= 26) {
    if (session.correct_answers >= 22)
      return session
        .remove()
        .exec()
        .then(Promise.resolve("passed"));
    return session.remove().then(Promise.resolve("failed"));
  }
  if (status) {
    return session.save().then(Promise.resolve("correct"));
  } else {
    return session.save().then(Promise.resolve("wrong"));
  }
}

function handleError(error, response) {
  let response_status = 400;
  let error_message;
  switch (error.message) {
    case "jwt must be provided":
      error_message = "token is missing";
      break;
    case "jwt must be a string":
      error_message = "token must be a string";
      break;
    case "jwt malformed":
      error_message = "invalid token";
      break;
    case "invalid token":
      error_message = "invalid token";
      break;
    case "session does not exist":
      error_message = "session does not exist";
      break;
    case "invalid number":
      error_message = "invalid number";
      break;
    case "invalid answers":
      error_message = "invalid answers";
      break;
    case "question does not exist":
      error_message = "question does not exist";
      break;
    default:
      response_status = 500;
      console.log(error);
  }
  response.status(response_status).json(error_message);
}
