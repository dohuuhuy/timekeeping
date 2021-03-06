const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const db = require("./app/models/db");
const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");
const worktime = require("./app/routes/worktime.router");
const sp = require("./app/routes/sp.routes");
const login = require("./app/routes/login.route");
const { check_token_login } = require("./app/middleware/login.controller");

const PORT = process.env.PORT || 80;

mongoose.Promise = global.Promise;

var opt_mongo = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  auto_reconnect: true,
};

start_server = async () => {
  try {
    await db.connect();
    await mongoose.connect(dbConfig.url, opt_mongo);
  } catch (error) {
    console.log("Loi db");
  }

  app.use("/worktime", check_token_login, worktime);

  app.use("/api", login);
  app.use("/api/account", check_token_login, sp);

  app.get("/", function (req, res) {
    res.json({ greeting: "Time_keeping wellcome" });
  });
  app.get("/worktime", function (req, res) {
    res.json({ greeting: "worktime wellcome" });
  });
  app.get("/api/account", function (req, res) {
    res.json({ greeting: "account wellcome" });
  });

  app.listen(PORT, () => {
    console.log(
      `Server is running on port http://localhost:${PORT}. \n\n -----------------Console.log()--------------------------`
    );
    // const moment = require("moment");
    // var x = "2020-12-26T00:12:00.000Z";
    // var c = moment(x).format("YYYY-MM-DD HH:mm:ss");
    // var y = "2020-12-26T05:12:00.000Z";
    // var d = moment(y).format("YYYY-MM-DD HH:mm:ss");

    // console.log("timCheckIn :>> ", c);
    // console.log("timCheckOut :>> ", d);
  });
};

start_server();
