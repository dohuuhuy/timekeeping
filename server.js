const express = require("express");
const bodyParser = require("body-parser");
const db = require("./app/models/db");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome " });
});
const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");
const worktime = require("./app/routes/worktime.router");
const sp = require("./app/routes/sp.routes");
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auto_reconnect: true,
  })
  .then(() => {
    //  console.log("Successfully connected to the database \n");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

db.connect((err) => {
  if (err) {
    console.log("unable to connect to database");
    process.exit(1);
  } else {

    app.use("/worktime", worktime);
    app.use("/api/account", sp);

    const PORT = process.env.PORT || 80;
    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}. \n\n -----------------Console.log()--------------------------`
      );
    });
  }
});



