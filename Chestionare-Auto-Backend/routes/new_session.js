const router = (module.exports = require("express").Router());
const config = require("../config");
const jsonwebtoken = require("jsonwebtoken");
const Session = require("../models/Session");
const Chestionar = require("../models/Chestionar");

router.post("/", (request, response) => {
  verify_input(request.body.category)
    .then(category => Chestionar(category).new())
    .then(chestionar => verify_if_chestionar_exists(chestionar))
    .then(chestionar => create_new_session(chestionar))
    .then(session => session.toObject())
    .then(session => {
      let res = {
        session,
        token: jsonwebtoken.sign(session._id.toString(), config.secret)
      };
      delete res.session._id;
      response.json(res);
    })
    .catch(error => handleError(error, response));
});

function verify_input(category) {
  return new Promise((resolve, reject) => {
    let categories = [
      "categoria_a",
      "categoria_b",
      "categoria_c",
      "categoria_d"
    ];
    if (category === undefined) reject(new Error("category is missing"));
    else if (categories.findIndex(cat => cat === category) === -1)
      reject(new Error("wrong category"));
    else resolve(category);
  });
}

function verify_if_chestionar_exists(chestionar) {
  if (chestionar === null)
    return Promise.reject(new Error("cannot get a new chestionar"));
  else return Promise.resolve(chestionar);
}

function create_new_session(chestionar) {
  let now = new Date();
  let new_session = {
    created_at: now,
    expiration_date: new Date(now.getTime() + 1800000),
    questions: chestionar,
    correct_answers: 0,
    wrong_answers: 0
  };
  return new Session(new_session).save();
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
