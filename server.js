const express = require("express");
const bodyParser = require("body-parser");
const db = require("./app/models/db");
const app = express();
const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");
const worktime = require("./app/routes/worktime.router");
const sp = require("./app/routes/sp.routes");
const rate = require("./app/routes/Rate");
const PORT = process.env.PORT || 80;


mongoose.Promise = global.Promise;

var opt_mongo = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  auto_reconnect: true,
};

start_server = async () => {
  
  await db.connect();
  await mongoose.connect(dbConfig.url, opt_mongo);

  app.use("/worktime", worktime);
  app.use("/api/account", sp);
  app.use("/api", rate);

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());



  app.get("/", function (req, res) {
    res.json({ greeting: "Worktime wellcome" });
  });

  app.listen(PORT, () => {
    console.log(
      `Server is running on port ${PORT}. \n\n -----------------Console.log()--------------------------`
    );
  });
};

start_server();
