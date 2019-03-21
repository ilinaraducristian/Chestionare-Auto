const router = (module.exports = require("express").Router());
const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");
const Session = require("../models/Session");

router.post("/", handleRequest);

function handleRequest(request, response) {
  verify_input(request.body.token)
    .then(id => Session.get_session(id))
    .then(session => verify_if_session_expired(session))
    .then(res => response.json(res))
    .catch(error => handleError(error, response));
}

function verify_input(token) {
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
  console.log(session);

  let now = new Date();
  if (now.getTime() > session.created_at.getTime() + 1800000) {
    if (session.correct_answers > 21)
      return session.remove().then(Promise.resolve({ status: "passed" }));
    return session.remove().then(Promise.resolve({ status: "failed" }));
  }
  if (session.correct_answers > 21)
    return session.remove().then(Promise.resolve({ status: "passed" }));
  if (session.wrong_answers > 4)
    return session.remove().then(Promise.resolve({ status: "failed" }));
  session = session.toObject();
  session.now = now;
  delete session["_id"];
  return Promise.resolve({ session });
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
  response.json({ error_message });
  // return error_message;
}
