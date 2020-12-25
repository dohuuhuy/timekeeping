const Support_record = require("../models/support_record.model");
const moment = require("moment");
const { FindBy, FindOne } = require("./../models/handlerDB");


DiffInMinutes = (e) => moment(new Date()).diff(moment(e), "minutes");

check_for_existence = async (obj) => {
  let r = obj.userCode
    ? { userCode: obj.userCode }
    : obj.bookingCode
    ? { bookingCode: obj.bookingCode }
    : null;

  return r == null
    ? {
        success: false,
        message: "Dữ liệu không hợp lệ !",
      }
    : (await FindOne("support_record", r)) === null
    ? {
        success: true,
        message: "Phiếu chưa được quét",
      }
    : {
        success: false,
        message: "Phiếu đã được quét",
      };
};

checkUserIsNew = async (obj) => {
  const code = obj.userCode;
  const bookingCode = obj.bookingCode;

  if (bookingCode) {
    try {
      const b = await FindOne("bookings", { bookingCode });
      if (DiffInMinutes(b.createdAt) > 10) {
        return {
          success: false,
          message: `Quá thời hạn ${DiffInMinutes(b.createdAt)} phút`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Không tìm thấy bookingCode !" + error,
      };
    }
  }
  if (code) {
    try {
      const p = await FindOne("patients", { code });
      const u = await FindOne("users", { _id: p.userId });
      const b = await FindBy("bookings", {
        userId: u._id.toString(),
      })
        .sort({ createdAt: 1 })
        .toArray();

      for (const i of b) {
        if (i.paymentStatus === 2) {
          if (DiffInMinutes(i.createdAt) > 10) {
            return {
              success: false,
              message: `Quá thời hạn ${DiffInMinutes(i.createdAt)} phút`,
            };
          }
          break;
        }
      }
    } catch (error) {
      return { success: false, message: "Không tìm thấy userCode !" + error };
    }
  }
};

exports.create = async (req, res) => {
  const time = new Date();
  const { userCode, bookingCode, verifyDescription } = req.body;
  const obj = {
    supporterId: res.locals.userId,
    userCode,
    time,
    bookingCode,
    verifyStatus: 0,
    verifyDescription,
  };

  const x = await check_for_existence(obj);
  console.log(x);
  if (x.success === false) {
    res.send(x);
  } else {
    const x = await checkUserIsNew(obj);
    console.log(x);
    if (x.success === false) {
      res.send(x);
    } else {
      try {
        const s = new Support_record(obj);
        if (await s.save())
          res.send({ success: true, message: "Thêm thành công !" });
      } catch (error) {
        res.status(500).send({
          message: err.message || "Not found" + error,
        });
      }
    }
  }
};

exports.findAll = async (req, res) => {
  try {
    supporterId = res.locals.userId;
    const x = await FindBy("support_record", { supporterId }).toArray();
    return x
      ? res.send(x)
      : res.status(404).send({ status: 404, message: "Not found with id" });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: "Error retrieving with id" + error,
    });
  }
};
