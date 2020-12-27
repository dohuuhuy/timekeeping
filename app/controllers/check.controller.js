const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");
const geolib = require("geolib");
const _curdate = new Date();

const Check_INPUT = async (req, obj) => {
  _ip = req.connection.remoteAddress;
  const ip = _ip.substring(7);
  const { userId, action } = obj;
  const { status, message: message_last } = (dta = await CheckLastchecksID(
    userId,
    action
  ));

  const {
    success: success_checkCondition,
  } = (checkCondition = await CheckCondition(obj, ip));

  switch (status) {
    case 0: // lastcheck check action
      return {
        success: false,
        message: `Bạn đã ${action ? "check-out" : "check-in"} ròi.`,
      };
    case 1: // lastcheck pass
      return success_checkCondition === false
        ? checkCondition
        : { success: true, message: message_last };
    case 2: // lastcheck require checkin new day
      return action == 0
        ? success_checkCondition === false // check conditions {location, ip }
          ? checkCondition
          : { success: true, message: message_last }
        : {
            success: false,
            message: "Vui lòng check-in để bắt đầu ngày làm việc mới.",
          };
    case 3: // lastcheck not data
      return { success: false, message: message_last };
  }
};

const CheckCondition = async (
  { locationId, latitude: laObj, longitude: loObj },
  ip
) => {
  const {
    condition,
    latitude: laDta,
    longitude: loDta,
    address,
  } = (dta = await Location.findOne({
    locationId: locationId,
  }));

  if (!dta) {
    return {
      success: false,
      message: `Cơ sở ${address} chưa được cập nhật hoặc đã.\n Vui lòng chọn cơ sở khác để thực hiện thao tác.`,
    };
  }
  if (!condition.length) {
    return {
      success: false,
      message: "Vui lòng kết nối internet và GPS để thực hiện thao tác.",
    }; // khong co conditions
  }

  for (let { type, details, details: scope } of condition) {
    switch (type) {
      case "IP":
        if (details.includes(ip)) return { success: true };
      case "GPS":
        const khoangCach = KhoangCach(laObj, loObj, laDta, loDta);
        if (scope <= scope) return { success: true };
      default:
        break;
    }

    const message =
      type === "IP"
        ? `IP ${ip} không hợp lệ. Vui lòng kết nối lại wifi.`
        : `Bạn đang ở ngoài nơi làm việc. Vui lòng đến ${address} để thực hiện thao tác.`;

    return { success: false, message, type };
  }
};
const KhoangCach = (laObj, loObj, laDta, loDta) =>
  geolib.getDistance(
    {
      latitude: laObj,
      longitude: loObj,
    },
    {
      latitude: laDta,
      longitude: loDta,
    }
  );
const CheckLastchecksID = async (userId, action) => {
  const { time, action: action_last } = (dta = await Checks.findOne({
    userId,
  }).sort({
    time: -1,
  }));
  const lastDate = moment(new Date()).format("l"); //  10/21/2020
  const curDate = moment(time).format("l"); //  10/21/2020

  if (!dta) return { status: 3, message: "Not-data" };
  if (lastDate != curDate) return { status: 2, message: "Skip-check" };

  return action != action_last
    ? { status: 1, message: "Ok-check" }
    : { status: 0, message: "No-check" };
};

exports.create = async (req, res) => {
  const {
    locationId,
    workshipId,
    partnerId,
    latitude,
    longitude,
    action,
    time,
    checkOutTime,
  } = req.body;
  const { userId } = res.locals;

  const locationDetail = await Location.findOne({ locationId });
  const workshipDetail = await Workship.findOne({ workshipId });

  if (!workshipDetail) {
    return res.send({
      success: false,
      status: 401,
      message: `Không tìm thấy workshipId`,
    });
  }

  if (!locationDetail) {
    return res.send({
      success: false,
      status: 401,
      message: `Không tìm thấy locationId`,
    });
  }

  const obj = {
    userId,
    partnerId,
    locationId,
    workshipId,
    latitude,
    longitude,
    action,
    time,
    checkOutTime,
    locationDetail,
    workshipDetail,
  };
  const check = new Checks(obj);

  if (workshipDetail.isRequireChecking === "CheckInTime") {
    const x = await check.save();

    return x
      ? res.send({
          success: true,
          status: 200,
          message: `CheckInTime thành công`,
        })
      : res.send({
          success: false,
          status: 401,
          message: "CheckInTime thất bại",
        });
  }

  if (workshipDetail.isRequireChecking === "CheckInAddress") {
    const ck = await Check_INPUT(req, obj);
    if (ck.success == false) {
      res.send(ck);
    } else {
      if (action == 1) {
        try {
          const x = await Checks.findOne({
            userId: res.locals.userId,
            action: 0,
          }).sort({
            time: -1,
          });
          const _id = x._id;
          const date = new Date();
          const y = await Checks.findByIdAndUpdate(_id, {
            $set: { checkOutTime: date.toISOString(), action: 1 },
          });

          return y
            ? res.send({
                success: true,
                status: 200,
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
        const x = await check.save();
        return x
          ? res.send({
              success: true,
              status: 200,
              message: `${action == 0 ? "Check In" : "Check Out"} thành công`,
            })
          : null;
      }
    }
  }
};

exports.findAll = async (req, res) => {
  return (x = await Checks.find()) && res.send(x);
};

exports.history_Checks_By_Date = async (req, res) => {
  const { fromDate, toDate, partnerId } = req.body;
  const { userId } = res.locals;
  const date = new Date(toDate);
  date.setDate(date.getDate() + 1);
  const params = {
    userId,
    partnerId,
    time: {
      $gte: new Date(fromDate),
      $lte: date,
    },
  };
  return (await Checks.find(params).sort({ time: -1 })) && res.send(rs);
};

exports.lastCheck = async (req, res) => {
  const { userId } = res.locals;
  const dta = await Checks.findOne({ userId }).sort({ time: -1 });
  if (!dta) return resSend(res, false, 401, (message = "không có data !"));
  const lastDate = moment().format("l"); //  10/21/2020
  const curDate = moment(dta.time).format("l"); //  10/21/2020
  let message = "không có last check trong ngày !";
  return lastDate != curDate
    ? resSend(res, false, 401, message)
    : res.status(200).send(dta);
};
const resSend = (res, success, status, message, data) => {
  res.status(status).send({
    success,
    status,
    message,
    data,
  });
};
