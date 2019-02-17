const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("./config");
const cors = require("cors");

const db = require("./config").mongoURI;

mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log("Connected to database!"))
  .catch(error => console.log(error));

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/new_session", require("./routes/new_session"));
app.use("/get_session", require("./routes/get_session"));
app.use("/submit_answer", require("./routes/submit_answer"));
app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(config.port, () => console.log("Server started!"));
