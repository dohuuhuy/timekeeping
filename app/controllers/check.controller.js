const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");
const moment = require("moment");
const geolib = require("geolib");
const _curdate = new Date();
const message = "";

const Check_INPUT = async (ip, obj) => {
  const { userId, action } = obj;
  const { status, message: message_last } = await CheckLastchecksID(userId, action);
  const { success: success_checkCondition } = await CheckCondition(obj, ip);

  switch (status) {
    case 0: // lastcheck check action
      return {
        success: false,
        message: `Bạn đã ${!action ? "check-out" : "check-in"} hôm nay.`,
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
            message: "Vui lòng check-in để bắt đầu ngày làm việc.",
          };
    case 3: // lastcheck not data
      return { success: false, message: message_last };
  }
};

const CheckCondition = async (
  { locationId, latitude: laObj, longitude: loObj },
  ip
) => {
  const dta = await Location.findOne({ locationId });

  if (!dta) {
    return {
      success: false,
      message: `Cơ sở ${dta.address} chưa được cập nhật hoặc đã.\n Vui lòng chọn cơ sở khác để thực hiện thao tác.`,
    };
  }

  const { condition, latitude: laDta, longitude: loDta, address } = dta;

  if (!condition.length) {
    return {
      success: false,
      message: "Vui lòng kết nối internet và GPS để thực hiện thao tác.",
    };
  }

  const khoangCach = KhoangCach(laObj, loObj, laDta, loDta);

  for (let { type, details } of condition) {
    switch (type) {
      case "IP":
        return details.includes(ip) && { success: true };
      case "GPS":
        return khoangCach <= details && { success: true };
    }
    message =
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

const CheckLastchecksID = async (userId) => {
  const dta = await Checks.findOne({ userId }).sort({
    time: -1,
  });
  if (!dta) return { status: 3, message: "Not-data" };
  const lastDate = moment().format("l"); // 10/21/2020
  const curDate = moment(dta.time).format("l"); // 10/21/2020
  return lastDate !== curDate
    ? { status: 2, message: "Skip-check" }
    : checkOutTime === null
    ? { status: 1, message: "Ok-check" }
    : { status: 0, message: "No-check" };
};

const resSend = (res, success, status, message, data) => {
  res.status(status).send({
    success,
    status,
    message,
    data,
  });
};

const update_UserID = async (_id) => {
  return await Checks.findByIdAndUpdate(_id, {
    $set: { checkOutTime: _curdate.toISOString(), action: 1 },
  });
};

const get_Id_UserID = async (userId) => {
  return await Checks.findOne({
    userId,
    action: 0,
  }).sort({
    time: -1,
  });
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

  if (workshipId && !workshipDetail) {
    message = `Không tìm thấy ${workshipId}`;
    return resSend(res, false, 401, message);
  }

  if (locationId && !locationDetail) {
    message = `Không tìm thấy ${locationId}`;
    return resSend(res, false, 401, message);
  }

  const obj = {
    userId,
    partnerId,
    locationId,
    workshipId,
    latitude,
    longitude,
    action,
    time: time || _curdate,
    checkOutTime: checkOutTime || _curdate,
    locationDetail,
    workshipDetail,
  };

  const check = new Checks(obj);

  if (workshipDetail.isRequireChecking === "CheckInTime") {
    message = "CheckInTime thành công";
    return (await check.save()) && resSend(res, true, 200, message);
  }

  if (workshipDetail.isRequireChecking === "CheckInAddress") {
    const ip = req.connection.remoteAddress.substring(7);
    const ck = await Check_INPUT(ip, obj);

    if (ck.success == false) return res.send(ck);
    if (action == 1) {
      try {
        const { _id } = await get_Id_UserID(userId);
        message = `${obj.action == 0 ? "Check In" : "Check Out"} thành công`;
        return (await update_UserID(_id)) && resSend(res, true, 200, message);
      } catch (error) {
        message = "Bạn phải check In";
        return resSend(res, false, 201, message);
      }
    } else {
      message = `${obj.action == 0 ? "Check In" : "Check Out"} thành công`;
      return (await check.save()) && resSend(true, 200, message);
    }
  }
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
  message = "không có last check trong ngày !";
  return lastDate != curDate
    ? resSend(res, false, 401, message)
    : res.status(200).send(dta);
};

exports.findAll = async (req, res) => {
  return (x = await Checks.find()) && res.send(x);
};
