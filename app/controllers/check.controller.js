const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");

const geolib = require("geolib");

exports.demo1 = (req, res) => {};

Check_INPUT = async (data) => {
  var dateTime = new Date();
  dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

  var userId = data.userId;
  var action = data.action;

  var countUserId = await Checks.countDocuments({ userId: userId });
  var checklastchecks = await CheckLastchecksID(userId, action);

  if (countUserId <= 0) {
    console.log("--> chưa có user");
    return -1;
  } else {
    console.log("--> đã có user");
    if (checklastchecks == 0) {
      console.log("--> check action");
      return 0;
    } else {
      console.log("|--> Bạn phải", !action ? "checkOut" : "checkIn");
      return 1;
    }
  }
};

CheckLastchecksID = async (userId, action) => {
  const dta = await Checks.find({ userId: userId }).sort({ time: -1 }).limit(1); // lây thằng cuôi cùng

  console.log("dta :>> ", dta);

  if (dta.length >= 1) {
    var date = new Date(); // ngay hiện tại
    var time = dta[0].time; // ngày trong db

    var x = moment(time).format("YYYY-MM-DD HH:mm:ss");
    var lastDate = moment(time).format("l"); //  10/21/2020
    var curDate = moment(date).format("l"); //  10/21/2020
    console.log("curDate :>> ", curDate);
    console.log("lastDate :>> ", x);

      var actionLast = dta[0].action;
      if (action != actionLast) {
        return 0; //  cho check
      }
    
  }

  return 1; // k  cho check
};

exports.create = async (req, res) => {
  const check = new Checks(req.body);
  var ck = await Check_INPUT(req.body);
  var errArr = [];

  var action = req.body.action;

  if (ck == 0) {
    check
      .save()
      .then((data) => {
        res.send({ message: "Thành công" });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Bị gián đoạn",
        });
      });
   // res.send({ message: "Thành công" });
  } else {
    if (ck == 1) {
      var ms = !action ? "checkOut" : "checkIn";
      errArr.push("Bạn phải " + ms);
    }
    if (ck == -1) {
      errArr.push("Chua co user");
    }
    console.log("LỖi >>>>>>>>", errArr);

    res.send({ error: errArr });
  }
};

exports.findAll = (req, res) => {
  Checks.find()
    .then((checks) => {
      res.send(checks);
      console.log(checks);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving checkss.",
      });
    });
};

exports.findOne = (req, res) => {
  Checks.find({ userId: req.params.checkId })
    .sort({ time: -1 })
    .limit(1)
    .then((checks) => {
      if (!checks) {
        return res.status(404).send({
          message: "checks not found with id " + req.params.checkId,
        });
      }
      res.send(checks);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "checks not found with id " + req.params.checkId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving checks with id " + req.params.checkId,
      });
    });
};

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
