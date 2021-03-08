const Checks = require("../models/checktime.model.js");
const Workship = require("../models/workship.model");
const Location = require("../models/location.model.js");

const moment = require("moment");
const geolib = require("geolib");
const { months } = require("moment");

const Check_INPUT = async (req, obj) => {
  _ip = req.connection.remoteAddress;
  const ip = _ip.substring(7);
  const { userId, action } = obj;
  const { status, message: message_last } = await CheckLastchecksID(
    userId,
    action
  );

  const {
    success: success_checkCondition,
  } = (checkCondition = await CheckCondition(obj, ip));
  const countUserId = await Checks.countDocuments({ userId });

  if (countUserId < 1) {
    if (success_checkCondition === false) {
      return checkCondition;
    } else {
      return { success: true, message: "Ok-check" };
    }
  }

  switch (status) {
    case 0: // lastcheck check action
      return {
        success: false,
        message: `Bạn đã ${action ? "check-out" : "check-in"} rồi.`,
      };
    case 1: // lastcheck pass
      return success_checkCondition === false
        ? checkCondition
        : { success: true, message: message_last };
    case 2: // lastcheck require checkin new day
      return action === 0
        ? success_checkCondition === false // check conditions {location, ip }
          ? checkCondition
          : { success: true, message: message_last }
        : {
            success: false,
            message: "Vui lòng check-in để bắt đầu ngày làm việc mới.",
          };
    case 3: // lastcheck not data
      return { success: false, message: message_last };
    // case 4: // check nghĩ không được chấm công trong thời gian nghỉ
    //   return { success: false, message: message_last };
  }
};

const CheckCondition = async (
  { locationId, latitude: laObj, longitude: loObj },
  ip
) => {
  const dta = await Location.findOne({
    locationId,
  });

  if (!dta) {
    return {
      success: false,
      message: `Cơ sở ${address} chưa được cập nhật hoặc đã.\n Vui lòng chọn cơ sở khác để thực hiện thao tác.`,
    };
  }
  const { condition, latitude: laDta, longitude: loDta, address } = dta;

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
        if (khoangCach <= scope) return { success: true };
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
  const dta = await Checks.findOne({
    userId,
  }).sort({
    time: -1,
  });

  if (!dta) return { status: 3, message: "Not-data" };

  const { time, action: action_last } = dta;
  const lastDate = moment().format("l"); //  10/21/2020
  const curDate = moment(time).format("l"); //  10/21/2020

  if (lastDate != curDate) return { status: 2, message: "Skip-check" };

  return action != action_last
    ? { status: 1, message: "Ok-check" }
    : { status: 0, message: "No-check" };

  // switch (workshipDetail.isRequireChecking) {
  //   case "CheckInTime":
  //     if (new Date() < checkOutTime) {
  //       return { status: 4, message: "Đang trong thời gian nghỉ" };
  //     } else return { status: 1, message: "Ok-check" };
  //   case "CheckInAddress":

  //     if (curDate != checkInTime) return { status: 2, message: "Skip-check" };
  //     else
  //       return action != action_last
  //         ? { status: 1, message: "Ok-check" }
  //         : { status: 0, message: "No-check" };

  //   default:
  //     break;
  // }
};

exports.create = async (req, res) => {
  // checkin chấm công
  const {
    locationId,
    workshipId,
    partnerId,
    latitude,
    longitude,
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

  const action = req.body.action ? parseInt(req.body.action) : 0;

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

  // là thời gian
  if (workshipDetail.isRequireChecking === "CheckInTime") {
    const x = await check.save();

    // kiểm tra thơì gian checkin checkout

    const checkin = moment(obj.time);
    const checkout = moment(obj.checkOutTime);

    // console.log("checkout > checkin :>> ", checkout < checkin);

    if (checkout < checkin) {
      return res.send({
        success: false,
        status: 400,
        message: `Thời gian ra không được lớn hơn thời gian vào`,
      });
    }
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
  // là địa điểm
  if (workshipDetail.isRequireChecking === "CheckInAddress") {
    const _curdate = new Date();
    const ck = await Check_INPUT(req, obj);
    if (ck.success == false) {
      res.send(ck);
    } else {
      if (action === 1) {
        try {
          const x = await Checks.findOne({
            userId: res.locals.userId,
            action: 0,
          }).sort({
            time: -1,
          });
          const _id = x._id;
          const y = await Checks.findByIdAndUpdate(_id, {
            $set: { checkOutTime: _curdate.toISOString(), action: Number(1) },
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

const list_Hist_in_address_by_date = async (userId, partnerId) => {
  now = moment();
  const start = now.startOf("day").toString();
  const end = now.endOf("day").toString();

  const params = {
    userId,
    partnerId,
    time: {
      $gte: start,
      $lte: end,
    },
  };
  try {
    const rs = await Checks.find(params).sort({ time: -1 });
    return rs;
  } catch (error) {
    return [];
  }
};

const list_Hist_in_time = async (userId, partnerId) => {
  now = moment();
  const start = now.startOf("day").toString();
  const params = {
    userId,
    partnerId,
    "workshipDetail.isRequireChecking": "CheckInTime",
    time: {
      $gte: start,
    },
  };
  try {
    const rs = await Checks.find(params).sort({ time: -1 });
    return rs;
  } catch (error) {
    return [];
  }
};

exports.history_Checks_By_Date = async (req, res) => {
  const { userId } = res.locals;
  const { partnerId } = req.body;

  // check lích sử của user x trong ngày
  const list_address = await list_Hist_in_address_by_date(userId, partnerId);

  // check list sử của user x có time check in time hay không ?
  const list_time = await list_Hist_in_time(userId, partnerId);

  const list_history = list_address.concat(list_time);
  return res.status(200).send(list_history);
};

exports.lastCheck = async (req, res) => {
  const { userId } = res.locals;
  const dta = await Checks.findOne({ userId }).sort({
    time: -1,
  });
  message = "không có data !";
  if (!dta) return resSend(res, false, 401, message);

  const { time } = dta;
  const lastDate = moment().format("l"); //  10/21/2020
  const curDate = moment(time).format("l");
  message = "không có last check trong ngày !";
  return lastDate != curDate
    ? resSend(res, false, 401, message)
    : res.status(200).send(dta);
};

const resSend = (res, success, status, message, data) => {
  return res.status(status).send({
    success,
    status,
    message,
    data,
  });
};
