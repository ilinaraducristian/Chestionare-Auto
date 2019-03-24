const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");

router.post("/", handleRequest);

function handleRequest(request, response) {
  verify_input(request.body.category)
    .then(category => Session.new(category))
    .then(session => prepare_response(session))
    .then(res => response.json(res))
    .catch(error => response.json({ error: error.message }));
}

function verify_input(category) {
  if (!category) return Promise.reject(new Error("category is misssing"));
  let categories = ["categoria_a", "categoria_b", "categoria_c", "categoria_d"];
  if (categories.findIndex(cat => cat === category) === -1)
    return Promise.reject(new Error("wrong category"));
  return Promise.resolve(category);
}

function prepare_response(session) {
  session = session.toObject();
  let token = jsonwebtoken.sign(session._id.toString(), config.secret);
  delete session._id;
  session.chestionare.map(chestionar => {
    delete chestionar.correct_answers;
    return chestionar;
  });
  return {
    session,
    token
  };
}
