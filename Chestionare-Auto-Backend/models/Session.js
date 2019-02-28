const mongoose = require("mongoose");
const session_schema = require("../schemas/session");

module.exports = mongoose.model("Session", session_schema);
