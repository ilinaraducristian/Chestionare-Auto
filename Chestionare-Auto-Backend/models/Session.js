const mongoose = require("mongoose");
const session_schema = require("../schemas/session_schema");

module.exports = mongoose.model("Session", session_schema);
