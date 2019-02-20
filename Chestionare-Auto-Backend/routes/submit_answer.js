const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");

router.post("/", (request, response) => {
  verify_input(request.body)
    .then(token => verify_token(token))
    .then(id => Session.findById(id).exec())
    .then(session => verify_if_session_expired(session))
    .then(result => verify_if_given_answers_are_correct(result, request.body))
    .then(status => response.json({ status }))
    .catch(error => handle_error(error, response));
});

function verify_input(request) {
  if (request.question_index === undefined)
    return Promise.reject(new Error("question_index is missing"));
  if (request.answers === undefined)
    return Promise.reject(new Error("answers is missing"));
  if (request.token === undefined)
    return Promise.reject(new Error("token is missing"));
  return Promise.resolve(request.token);
}

function verify_token(token) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, config.secret, (error, id) => {
      if (error) reject(error);
      else resolve(id);
    });
  });
}

function verify_if_session_expired(session) {
  if (session === null)
    return Promise.reject(new Error("session does not exist"));
  let created_at = new Date(session.created_at);
  if (new Date().getTime() > created_at.getTime() + 1800000) {
    if (session.correct_answers > 21)
      return Promise.resolve({ status: "passed", session });
    return Promise.resolve({ status: "failed", session });
  }

  return Promise.resolve({ status: null, session });
}

function verify_if_given_answers_are_correct({ status, session }, request) {
  if (status === "passed" || status === "failed") {
    return session.remove().then(Promise.resolve(status));
  }
  let question = session.questions[request.question_index];

  if (question === null || question === undefined)
    return Promise.reject(new Error("question does not exist"));

  status = request.answers === question.correct_answers;
  return new Promise(resolve => {
    if (status) {
      session.correct_answers++;
      if (session.correct_answers > 21)
        return session.remove().then(resolve("passed"));

      session.questions.splice(request.question_index, 1);
      session.save().then(resolve("correct"));
    } else {
      session.wrong_answers++;
      if (session.wrong_answers > 4)
        return session.remove().then(resolve("failed"));

      session.questions.splice(request.question_index, 1);
      session.save().then(resolve("wrong"));
    }
  });
}

function handle_error(error, response) {
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
