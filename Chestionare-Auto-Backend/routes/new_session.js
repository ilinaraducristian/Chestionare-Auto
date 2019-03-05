const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");
const mongoose = require("mongoose");
const chestionar_schema = require("../schemas/chestionar");

router.post("/", handleRequest);

function handleRequest(request, response) {
  verify_input(request.body.category)
    .then(get_chestionare)
    .then(create_new_session)
    .then(session => prepare_response(session.toObject()))
    .then(res => response.json(res))
    .catch(error => handleError(error, response));
}

function verify_input(category) {
  if (category === undefined || category === null)
    return Promise.reject(new Error({ stats: "asd" }));
  let categories = ["categoria_a", "categoria_b", "categoria_c", "categoria_d"];
  if (categories.findIndex(cat => cat === category) === -1)
    return Promise.reject(new Error("wrong category"));
  return Promise.resolve(category);
}

function get_chestionare(category) {
  return mongoose
    .model(category, chestionar_schema, category)
    .aggregate([{ $sample: { size: 26 } }, { $project: { _id: 0 } }])
    .exec();
}

function create_new_session(chestionare) {
  if (chestionare === null)
    return Promise.reject(new Error("cannot get a new chestionar"));
  let new_session = {
    created_at: new Date(),
    chestionare: chestionare,
    correct_answers: 0,
    wrong_answers: 0
  };
  return new Session(new_session).save();
}

function prepare_response(session) {
  let token = jsonwebtoken.sign(session._id.toString(), config.secret);
  delete response.session._id;
  session.chestionare.map(chestionar => {
    delete chestionar.correct_answers;
    return chestionar;
  });
  return {
    session,
    token
  };
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
