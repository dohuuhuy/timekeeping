const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");
const geolib = require("geolib");
const { update } = require("../models/checktime.model.js");

Check_INPUT = async (req, data) => {
  _ip = req.connection.remoteAddress;

  var ip = _ip.substring(7);
  //console.log("y :>> ", _ip);

  var dateTime = new Date();
  dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

  var userId = data.userId;
  console.log("userId :>> ", userId);
  var action = data.action;

  var countUserId = await Checks.countDocuments({ userId });
  var checklastchecks = await CheckLastchecksID(userId, action);
  var checkCondition = await CheckCondition(data.locationId, data, ip);

  if (countUserId < 1) {
    if (checkCondition.success === false) {
      return checkCondition;
    } else {
      return { success: true, message: "Ok-check" };
    }
  } else {
    if (checklastchecks.status == 1) {
      if (checkCondition.success === false) {
        return checkCondition;
      } else {
        return { success: true, message: "Ok-check" };
      }
    }
    if (checklastchecks.status == 2) {
      if (action == 0) {
        if (checkCondition.success === false) {
          return checkCondition;
        } else {
          return { success: true, message: "Ok-check" };
        }
      } else {
        return { success: false, message: "Bạn phải checkIn vào ngày mới" };
      }
    } else {
      return {
        success: false,
        message: `Bạn phải ${!action ? "checkOut" : "checkIn"}`,
      };
    }
  }
};

CheckCondition = async (locationId, data, ip) => {
  var dta = await Location.findOne({ locationId: locationId });
  // console.log("dta :>> ", dta);

  if (!dta) {
    return { success: false, type: "Không tìm thấy locationID" };
  } else {
    if (!dta.condition.length) {
      console.log("khong co conditons");
      return { success: false, type: "Không có điều kiện kiểm tra " }; // khong co conditions
    }

    for (var value of dta.condition) {
      switch (value.type) {
        case "IP":
          //  ip = "103.199.41.191";
          if (value.details.includes(ip)) {
            return { success: true };
          }

        case "GPS":
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

          var condition = value.details;
          if (khoangCach <= condition) {
            return { success: true };
          }

          break;
        default:
          break;
      }
      return { success: false, type: value.type };
    }
  }
};

CheckLastchecksID = async (userId, action) => {
  const dta = await Checks.findOne({ userId: userId }).sort({
    time: -1,
  });
  // console.log("CheckLastchecksID :>> ", dta.time);

  if (dta) {
    var lastDate = moment(new Date()).format("l"); //  10/21/2020
    var curDate = moment(dta.time).format("l"); //  10/21/2020

    if (lastDate != curDate) {
      return { status: 2, message: "Skip-check" };
    }
    var actionLast = dta.action;
    if (action != actionLast) {
      return { status: 1, message: "Ok-check" };
    } else {
      return { status: 0, message: "No-check" };
    }
  }
};

exports.create = async (req, res) => {
  const locationId = req.body.locationId;
  const workshipId = req.body.workshipId;

  const location = await Location.findOne({ locationId });
  const workship = await Workship.findOne({ workshipId });

  const obj = {
    userId: res.locals.userId,
    //userId: req.body.userId,
    locationId: req.body.locationId,
    locationDetail: location,
    workshipId: req.body.workshipId,
    workshipDetail: workship,
    partnerId: req.body.partnerId,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    action: req.body.action,
  };

  //  console.log("obj :>> ", obj);

  const check = new Checks(obj);

  var ck = await Check_INPUT(req, obj);
  var action = req.body.action;

  console.log("ck", ck);

  if (ck.success == false) {
    res.send(ck);
  } else {
    if (req.body.action == 1) {
      try {
        var x = await Checks.findOne({
          userId: res.locals.userId,
          action: 0,
        }).sort({
          time: -1,
        });
        console.log("x", x);
        var _id = x._id;
        var date = new Date();
        console.log(date);
        var y = await Checks.findByIdAndUpdate(_id, {
          $set: { checkOutTime: date.toISOString(), action: 1 },
        });

        return y
          ? res.send({
              success: true,
              message: `${action == 0 ? "Check In" : "Check Out"} thành công`,
            })
          : null;
      } catch (error) {
        res.send({
          success: false,
          message: "Bạn phải check In",
        });
      }
    } else {
      var x = await check.save();
      return x
        ? res.send({
            success: true,
            message: `${action == 0 ? "Check In" : "Check Out"} thành công`,
          })
        : null;
    }
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

exports.history_Checks_By_Date = async (req, res) => {
  let fromDate = req.body.fromDate;
  let toDate = req.body.toDate;
  let userId = res.locals.userId;
  //let userId = req.body.userId;
  let partnerId = req.body.partnerId;

  var date = new Date(toDate);
  date.setDate(date.getDate() + 1);

  var rs = await Checks.find({
    userId,
    partnerId,
    time: {
      $gte: new Date(fromDate),
      $lte: date,
    },
  }).sort({ time: -1 });

  // console.log("rs", rs);
  res.send(rs);
};

exports.lastCheck = async (req, res) => {
  console.log("res.locals.userId  :>> ", res.locals.userId);
  const dta = await Checks.findOne({ userId: res.locals.userId }).sort({
    time: -1,
  });

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
      return res.send({
        success: false,
        message: "không có last check trong ngày !",
      });
    } else {
      return res.send(dta);
    }
  } else {
    return res.send({ success: false, message: "không có data !" });
  }
};
