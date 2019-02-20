const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");
const mongoose = require("mongoose");
const question_schema = require("../schemas/question_schema");

router.post("/", (request, response) => {
  verify_input(request.body.category)
    .then(category => create_new_chestionar(category))
    .then(chestionar => verify_if_chestionar_exists(chestionar))
    .then(chestionar => create_new_session(chestionar))
    .then(session => prepare_response(session.toObject()))
    .then(res => response.json(res))
    .catch(error => handleError(error, response));
});

function verify_input(category) {
  if (category === undefined)
    return Promise.reject(new Error("category is missing"));
  let categories = ["categoria_a", "categoria_b", "categoria_c", "categoria_d"];
  if (categories.findIndex(cat => cat === category) === -1)
    return Promise.reject(new Error("wrong category"));
  return Promise.resolve(category);
}

function create_new_chestionar(category) {
  return mongoose
    .model(category, question_schema, category)
    .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
    .exec();
}

function verify_if_chestionar_exists(chestionar) {
  if (chestionar === null)
    return Promise.reject(new Error("cannot get a new chestionar"));
  return Promise.resolve(chestionar);
}

function create_new_session(chestionar) {
  let new_session = {
    created_at: new Date(),
    questions: chestionar,
    correct_answers: 0,
    wrong_answers: 0
  };
  return new Session(new_session).save();
}

function prepare_response(session) {
  session.questions.map(question => {
    delete question.correct_answers;
    return question;
  });
  let response = {
    session,
    token: jsonwebtoken.sign(session._id.toString(), config.secret)
  };
  delete response.session._id;
  return response;
}

function handleError(error, response) {
  let response_status = 400;
  let error_message;
  switch (error.message) {
    case "category is missing":
      error_message = "category is missing";
      break;
    case "wrong category":
      error_message = "wrong category";
      break;
    default:
      response_code = 500;
      console.log(error);
  }
  response.status(response_status).json({ error_message });
}
