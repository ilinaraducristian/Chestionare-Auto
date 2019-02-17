const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");

router.post("/", (request, response) => {
  verify_user_input(request.body)
    .then(verify_token)
    .then(id => Session.findById(id).exec())
    .then(session => verify_if_session_exists(session))
    .then(session => verify_if_session_expired(session, request.body))
    .then(res => response.json(res))
    .catch(error => handleError(error, response));
});

function verify_user_input(request) {
  return new Promise((resolve, reject) => {
    if (typeof request.question !== "string")
      reject(new Error("invalid question"));
    else if (typeof request.answers !== "string")
      reject(new Error("invalid answers"));
    else resolve(request.token);
  });
}

function verify_token(token) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, config.secret, (error, id) => {
      if (error) reject(error);
      else resolve(id);
    });
  });
}

function verify_if_session_exists(session) {
  if (session === null)
    return Promise.reject(new Error("session does not exist"));
  else return Promise.resolve(session);
}

function verify_if_session_expired(session, request_body) {
  // console.log(session);
  let status;
  if (new Date().getTime() >= new Date(session.expiration_date).getTime()) {
    if (session.wrong_answers >= 5 || session.correct_answers < 22) {
      status = "failed";
    } else {
      status = "passed";
    }
  } else if (session.wrong_answers >= 5) {
    status = "failed";
  }

  if (status) {
    return session.remove().then({ status });
  } else {
    return verify_if_given_answers_are_correct(session, request_body);
  }
}

function verify_if_given_answers_are_correct(session, request) {
  let question_index;
  let question = session.questions.find((question, index) => {
    if (question.question === request.question) {
      question_index = index;
      return true;
    }
  });

  if (question === null || question === undefined)
    return Promise.reject(new Error("question does not exist"));
  let isCorrect = false;
  if (question.correct_answers === request.answers) isCorrect = true;

  session.questions.splice(question_index, 1);

  if (isCorrect) session.correct_answers++;
  else session.wrong_answers++;

  let promises = [];
  promises[0] = { answer: isCorrect };

  if (session.questions.length === 0 || session.wrong_answers === 5)
    promises[1] = session.remove();
  else promises[1] = session.save();

  return Promise.all(promises);
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
  response.status(response_status).json({ error_message });
}
