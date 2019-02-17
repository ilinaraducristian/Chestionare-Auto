const router = (module.exports = require("express").Router());
const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");
const Session = require("../models/Session");

router.post("/", (request, response) => {
  verify_token(request.body.token)
    .then(id => Session.findById(id).exec())
    .then(session => verify_if_session_exists(session))
    .then(session => verify_if_session_expired(session))
    .then(res => response.json(res))
    .catch(error => handleError(error, response));
});

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

function verify_if_session_expired(session) {
  let status;
  let now = new Date();
  if (now.getTime() >= new Date(session.expiration_date).getTime()) {
    if (session.wrong_answers < 5 && session.correct_answers >= 22)
      status = "passed";
    else status = "failed";
    return session.remove().then(Promise.resolve({ status }));
  } else {
    if (session.wrong_answers >= 5) status = "failed";
    else if (session.correct_answers >= 22) status = "passed";
    if (status) return session.remove().then(Promise.resolve({ status }));
    session = session.toObject();
    session.now = now;
    delete session["_id"];
    return Promise.resolve({ session });
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
    default:
      response_code = 500;
      console.log(error);
  }
  response.status(response_status).json({ error_message });
}
