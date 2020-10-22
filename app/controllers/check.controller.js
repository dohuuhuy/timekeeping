const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");
const geolib = require("geolib");

Check_INPUT = async (req) => {
  var data = req.body;

  _ip = req.connection.remoteAddress;

  var ip = _ip.substring(7);
  // console.log("y :>> ", ip);

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
      if (checkCondition.success === false) {
        return checkCondition.type;
      }
      else {
        return "Ok-check"
      }

    }
    if (checklastchecks == "Skip-check") {
      if (action == 0) {

        if (checkCondition.success === false) {
          return checkCondition.type;
        }
        else {
          return "Ok-check";
        }
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
  // console.log("dta :>> ", dta);

  if (!dta) {
    return { success: false, type: "No-locationID" }
  } else {
    if (!dta.condition.length) {
      console.log("khong co conditons");
      return { success: false, type: "No-condition" } // khong co conditions
    }

    for (var value of dta.condition) {
      console.log('value type :>> ', value.type);

      switch (value.type) {
        case "IP":
          console.log("- IP");
          //ip = "27.74.247.203";
          if (!value.details.includes(ip)) {
            return { success: false, type: "IP" };
          }

          break;
        case "Wifi":
          console.log("- wifi");

          wifi_Client = data.wifiDetail.details;
          wifi_Server = value.details;

          if (
            wifi_Client.bssid !== wifi_Server.bssid &&
            wifi_Client.ipAddress !== wifi_Server.ipAddress &&
            wifi_Client.ssid !== wifi_Server.ssid
          ) {
            return { success: false, type: "Wifi" };
          }

          break;
        case "GPS":
          console.log("- GPS");
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
          if (khoangCach >= condition) {
            return { success: false, type: "GPS" };
          }
          break;
        default:
          break;
      }

    }
    return { success: true };
  }

}

CheckLastchecksID = async (userId, action) => {
  const dta = await Checks.find({ userId: userId }).sort({ time: -1 }).limit(1); // lây thằng cuôi cùng

  //console.log("dta :>> ", dta);

  if (dta.length >= 1) {
    var date = new Date(); // ngay hiện tại
    var time = dta[0].time; // ngày trong db

    var x = moment(time).format("YYYY-MM-DD HH:mm:ss");
    var lastDate = moment(time).format("l"); //  10/21/2020
    var curDate = moment(date).format("l"); //  10/21/2020
    //console.log("curDate :>> ", curDate);
    //console.log("lastDate :>> ", x);

    //kiểm tra 2 hành động trong ngày co bị trùng hay không
    if (lastDate != curDate) {
      return "Skip-check";
    }
    var actionLast = dta[0].action;
    if (action != actionLast) {
      //khác hành động
      return "Ok-check"; //  cho check
    } else {
      return "No-check"; // k  cho check
    }
  }
};

exports.create = async (req, res) => {
  const check = new Checks(req.body);
  var ck = await Check_INPUT(req);
  var errArr = ""

  var action = req.body.action;

  if (ck == "Ok-check") {
    check
      .save()
      .then((data) => {
        res.send({ success: true, message: "Thành công" });
      })
      .catch((err) => {
        res
          .status(500)
          .send({ success: false, message: err.message || "Bị gián đoạn" });
      });
  //  res.send({ message: "Thành công" });
  } else {
    if (ck == "Find-check") {
      var ms = !action ? "checkOut" : "checkIn";
      errArr = { message: "Bạn phải " + ms };
    }

    if (ck == "New-check") {
      errArr = { message: "Phai checkIn vao ngay moi" };
    }
    if (ck == "IP") {
      errArr = {
        message: "IP không thể xác thực",
        type: "IP",
      };
    }
    if (ck == "Wifi") {
      errArr = {
        message: "wifi không thể xác thực",
        type: "wifi",
      };
    }
    if (ck == "GPS") {
      errArr = {
        message: "Check ngoài phạm vi cho phép",
        type: "GPS",
      };
    }
    if (ck == "No-condition") {
      errArr = { message: "Không có conditions" };
    }
    if (ck == "No-User") {
      errArr = { message: "Chua co user" };
    }
    if (ck == "No-locationID") {
      errArr = { message: "Không tìm thấy locationId" };
    }
    console.log("LỖi >>>>>>>>", errArr);

    res.send({ success: false, error: errArr });
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
        success: false,
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

exports.update = (req, res) => { };

exports.delete = (req, res) => { };
