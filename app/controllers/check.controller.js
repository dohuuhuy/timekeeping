const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");
const geolib = require("geolib");

Check_INPUT = async (req) => {
  var data = req.body;

  _ip = req.connection.remoteAddress;

  var ip = _ip.substring(7);
  console.log("y :>> ", _ip);

  var dateTime = new Date();
  dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

  var userId = data.userId;
  var action = data.action;

  var countUserId = await Checks.countDocuments({ userId: userId });
  var checklastchecks = await CheckLastchecksID(userId, action);
  var checkCondition = await CheckCondition(data.locationId, data, ip);

  if (countUserId <= 0) {
    console.log("--> chưa có user");
    console.log("checkCondition.success :>> ", checkCondition);
    if (checkCondition.success === false) {
      return checkCondition.type;
    } else {
      return "Ok-check";
    }
  } else {
    console.log("--> đã có user");
    if (checklastchecks == "Ok-check") {
      console.log("--> check action");

      console.log("checkCondition.success :>> ", checkCondition);
      if (checkCondition.success === false) {
        return checkCondition.type;
      } else {
        return "Ok-check";
      }
    }
    if (checklastchecks == "Skip-check") {
      if (action == 0) {
        if (checkCondition.success === false) {
          return checkCondition.type;
        } else {
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
  //  console.log("dta :>> ", dta);

  if (!dta) {
    return { success: false, type: "No-locationID" };
  } else {
    if (!dta.condition.length) {
      console.log("khong co conditons");
      return { success: false, type: "No-condition" }; // khong co conditions
    }

    for (var value of dta.condition) {
      console.log("value type :>> ", value.type);

      switch (value.type) {
        case "IP":
          console.log("- IP" + ip);

         // ip = "27.74.247.203";
          if (!value.details.includes(ip)) {
            console.log("IP loi :>> ");
            return { success: false, type: "IP" };
          }

          break;
        case "Wifi":
          console.log("- wifi");

          wifi_Client = data.wifiDetail.details;
          wifi_Server = value.details;

          console.log("wifi_Client", wifi_Client);
          console.log("wifi_Server :>> ", wifi_Server);

          if (
            wifi_Client.bssid !== wifi_Server.bssid ||
            wifi_Client.ipAddress !== wifi_Server.ipAddress ||
            wifi_Client.ssid !== wifi_Server.ssid
          ) {
            console.log("wifi loi :>> ");
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
            console.log("GPS loi :>> ");
            return { success: false, type: "GPS" };
          }
          break;
        default:
          break;
      }
    }
    return { success: true };
  }
};

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
  var errArr = "";
  var action = req.body.action;

  switch (ck) {
    case "Find-check":
      errArr = { message: "Bạn phải " + (!action ? "checkOut" : "checkIn") };
      break;
    case "New-check":
      errArr = { message: "Phai checkIn vao ngay moi" };
      break;
    case "IP":
      errArr = {
        message: "IP không thể xác thực",
        type: "IP",
      };
      break;
    case "Wifi":
      errArr = {
        message: "wifi không thể xác thực",
        type: "wifi",
      };
      break;
    case "GPS":
      errArr = {
        message: "Check ngoài phạm vi cho phép",
        type: "GPS",
      };
      break;
    case "No-condition":
      errArr = { message: "Không có conditions" };
      break;
    case "No-User":
      errArr = { message: "Chua co user" };
      break;
    case "No-locationID":
      errArr = { message: "Không tìm thấy locationId" };
      break;
    case "Ok-check":
      return await check
        .save()
        .then((data) => {
          res.send({ success: true, message: "Thành công" });
        })
        .catch((err) => {
          res
            .status(500)
            .send({ success: false, message: err.message || "Bị gián đoạn" });
        });
    //    return res.send({ message: "Thành công" });
    default:
      errArr = { message: "Không tìm thấy " };
      break;
  }

  res.send({ success: false, error: errArr });
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

exports.findOne = async (req, res) => {
 

  const dta = await Checks.findOne({ userId: req.params.checkId }).sort({ time: -1 }).limit(1);

  console.log("dta :>> ", dta);

  if (dta) {
    var date = new Date(); // ngay hiện tại
    var time = dta.time; // ngày trong db

    var x = moment(time).format("YYYY-MM-DD HH:mm:ss");
    var lastDate = moment(time).format("l"); //  10/21/2020
    var curDate = moment(date).format("l"); //  10/21/2020
    console.log("curDate :>> ", curDate);
    console.log("lastDate :>> ", x);

    if (lastDate != curDate) {
      return res.send({success:false, message:"không có last check trong ngày !"});
    }
    else{
      return res.send(dta);
    }

  }
  else
  {
     return res.send({success:false,message:"không có data !"});
  }
 
};

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
