const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");

const geolib = require("geolib");

demo2 = () => {
  (a = 1), (b = 2);
  if (a + 1 == 1) {
    return "ok";
  }
  return "no-ok";
};

exports.demo1 = (req, res) => {
  x = demo2();
  if (x == "no-ok") {
    console.log("haha");
    res.send({ message: "hduhcehcnodw" });
  }
};

Check_INPUT = async (req) => {
  var data = req.body;

  _ip = req.connection.remoteAddress;

  var ip = _ip.substring(7);
  console.log("y :>> ", ip);

  var dateTime = new Date();
  dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

  var userId = data.userId;
  var action = data.action;

  var countUserId = await Checks.countDocuments({ userId: userId });
  var checklastchecks = await CheckLastchecksID(userId, action);
  var checkCondition = await CheckCondition(data.locationId, data, ip);

  if (countUserId <= 0) {
    console.log("--> chưa có user");
    return "Ok-check"; // No-user
  } else {
    console.log("--> đã có user");
    if (checklastchecks == "Ok-check") {
      console.log("--> check action");
      if (checkCondition == "No-IP") {
        console.log("không có IP");
        return "No-IP";
      }
      if (checkCondition == "No-Wifi") {
        console.log("không có wifi");
        return "No-Wifi";
      }
      if (checkCondition == "No-GPS") {
        console.log("không có gps");
        return "No-GPS";
      }
      if (checkCondition == "No-condition") {
        console.log("không có conditions");
        return "No-condition";
      }
      if (checkCondition == "No-locationID") {
        return "No-locationID";
      }

      if (
        checkCondition == "Wifi" ||
        checkCondition == "GPS" ||
        checkCondition == "IP" ||
        (checkCondition == "Wifi" &&
          checkCondition == "GPS" &&
          checkCondition == "IP")
      ) {
        return "Ok-check";
      }
    }
    if (checklastchecks == "Skip-check") {
      if (action == 0) {
        return "Ok-check";
      } else {
        console.log("--> Bạn phải checkIn vao ngày mới");
        return "New-check";
      }
    } else {
      console.log("|--> Bạn phải", !action ? "checkOut" : "checkIn");
      return "Find-check";
    }
  }
};

CheckCondition = async (locationId, data, ip) => {
  var dta = await Location.findOne({ locationId: locationId });
console.log("dta :>> ", dta);
  var result = "";
  if (!dta) {
    result = "No-locationID";
  } else {
    if (!dta.condition.length) {
      console.log("khong co conditons");
      result = "No-condition"; // khong co conditions
    }
    for (let value of dta.condition) {
      console.log(value.type);
      if (value.type == "IP") {
        // ip = "27.74.247.203";
        if (value.details.includes(ip)) {
          console.log("có ip trong danh sách");
          result = "IP";
        } else {
          result = "No-IP";
        }
      }

      if (value.type == "Wifi") {
        console.log("------------> Wifi");

        wifi_Client = data.wifiDetail.details;
        wifi_Server = value.details;

        if (
          wifi_Client.bssid === wifi_Server.bssid &&
          wifi_Client.ipAddress === wifi_Server.ipAddress &&
          wifi_Client.ssid === wifi_Server.ssid
        ) {
          console.log("tồn tại wifi");
          result = "Wifi"; //tồn tại wifi
        } else {
          console.log("không co wifi");
          result = "No-Wifi"; // không co wifi
        }
      }
      if (value.type == "GPS") {
        console.log(" ----------> GPS");
        var lat = dta.latitude;
        var long = dta.longitude;
        var khoangCach = geolib.getDistance(
          {
            latitude: data.latitude,
            longitude: data.longitude,
          },
          {
            latitude: lat,
            longitude: long,
          }
        );
        console.log("khoangCach :>> ", khoangCach);

        var condition = value.details;
        if (khoangCach <= condition) {
          console.log("trong phạm vi \n");
          result = "GPS"; // cho check
        } else {
          console.log("ngoài phạm vi \n");
          result = "No-GPS"; // khong cho check
        }
      }
    }
  }

  return result;
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

    //kiểm tra 2 hành động trong ngày co bị trùng hay không
    if (lastDate == curDate) {
      var actionLast = dta[0].action;
      if (action != actionLast) {
        //khác hành động
        return "Ok-check"; //  cho check
      } else {
        return "No-check"; // k  cho check
      }
    } else {
      //  console.log("run");
      return "Skip-check";
    }
  }
};

exports.create = async (req, res) => {
  const check = new Checks(req.body);
  var ck = await Check_INPUT(req);
  var errArr = [];

  var action = req.body.action;

  if (ck == "Ok-check") {
    check
      .save()
      .then((data) => {
        res.send({ succes: true, message: "Thành công" });
      })
      .catch((err) => {
        res
          .status(500)
          .send({ succes: false, message: err.message || "Bị gián đoạn" });
      });
    // res.send({ message: "Thành công" });
  } else {
    if (ck == "Find-check") {
      var ms = !action ? "checkOut" : "checkIn";
      errArr.push({ succes: false, message: "Bạn phải " + ms });
    }

    if (ck == "New-check") {
      errArr.push({ succes: false, message: "Phai checkIn vao ngay moi" });
    }
    if (ck == "No-IP") {
      errArr.push({
        succes: false,
        message: "IP không thể xác thực",
        type: "IP",
      });
    }
    if (ck == "No-Wifi") {
      errArr.push({
        succes: false,
        message: "wifi không thể xác thực",
        type: "wifi",
      });
    }
    if (ck == "No-GPS") {
      errArr.push({
        succes: false,
        message: "Check ngoài phạm vi cho phép",
        type: "GPS",
      });
    }
    if (ck == "No-condition") {
      errArr.push({ succes: false, message: "Không có conditions" });
    }
    if (ck == "No-User") {
      errArr.push({ succes: false, message: "Chua co user" });
    }
    if (ck == "No-locationID") {
      errArr.push({ succes: false, message: "Không tìm thấy locationId" });
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
        succes: false,
        message: err.message || "Some error occurred while retrieving .",
      });
    });
};

exports.findOne = (req, res) => {
  Checks.findOne({ userId: req.params.checkId })
    .sort({ time: -1 })
    .limit(1)
    .then((checks) => {
      if (!checks) {
        return res.status(404).send({});
      }
      res.send(checks);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({});
      }
      return res.status(500).send({});
    });
};

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
