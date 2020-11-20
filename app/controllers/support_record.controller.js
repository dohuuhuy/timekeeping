const Support_record = require("../models/support_record.model");
const moment = require("moment");

const db = require("./../models/db");

DiffInMinutes = (createdAt) => {
  var date = new Date();
  var curDate = moment(date);
  var bookingDate = moment(createdAt);
  var diffInMinutes = curDate.diff(bookingDate, "minutes");
  return diffInMinutes;
};

checkUserIsNew = async (req, res, obj) => {
  var data = obj;

  console.log("data: >>> ", data);

  if (data.bookingCode) {
    var bookingCode = data.bookingCode;
    try {
      var bookings = await db
        .getDB()
        .collection("bookings")
        .find({ bookingCode: bookingCode })
        .toArray();

      //console.log("Tìm_booking_code :>> ", bookings);

      var userId = bookings[0].userId;
      var createdAt = bookings[0].createdAt;
      var diffInMinutes = DiffInMinutes(createdAt);

      var listBookings = await db
        .getDB()
        .collection("bookings")
        .find({ userId: userId })
        .count();

      console.log("listBookings :>> ", listBookings);
      console.log("thời gian tạo :>> ", diffInMinutes, "phút trước");

      if (diffInMinutes > 10) {
        return { success: false, message: "Thời gian quá giới hạn" };
      }
      if (listBookings > 1) {
        return { success: false, message: "Số lượng quá giới hạn" };
      }
      return { success: true, message: "Là User mới" };
    } catch (error) {
      return { success: false, message: "Không tìm thấy bookingCode" };
    }
  }

  if (data.userCode) {
    var code = data.userCode;
    console.log("code :>> ", code);
    try {
      var patients = await db
        .getDB()
        .collection("patients")
        .find({ code: code })
        .toArray();

      // console.log("patients :>> ", patients);

      var userId = patients[0].userId;
      var createdAt = patients[0].createdAt;

      var users = await db
        .getDB()
        .collection("users")
        .find({ _id: userId })
        .toArray();

      // console.log("Tìm_users :>> ", users);
      var userId = users[0]._id.toString();
      // console.log('userId :>> ', userId);
      var listBookings = await db
        .getDB()
        .collection("bookings")
        .find({ userId: userId })
        .count();

      console.log("listBookings :>> ", listBookings);

      var bookings = await db
        .getDB()
        .collection("bookings")
        .find({ userId: userId })
        .sort({ createdAt: 1 })
        .toArray();

      var createdAt = bookings[0].createdAt;

      var diffInMinutes = DiffInMinutes(createdAt);
      console.log("thời gian tạo :>> ", diffInMinutes, "phút trước");

      if (listBookings > 1) {
        return { success: false, message: "Số lượng quá giới hạn" };
      }
      if (diffInMinutes > 10) {
        return { success: false, message: "Thời gian quá giới hạn" };
      }
      return { success: true, message: "Là User mới" };
    } catch (error) {
      //  res.send({ success: false, message: "Dữ liệu không hợp lệ" });
      return { success: false, message: "Không tìm thấy userCode !" };
    }
  } else {
    //  res.send({ success: false, message: "Dữ liệu không hợp lệ" });
    return { success: false, message: "Dữ liệu không hợp lệ !" };
  }
};

check_for_existence = async (obj) => {
  if (obj.userCode) {
    console.log(1);
    try {
      var x = await db
        .getDB()
        .collection("support_record")
        .findOne({ userCode: obj.userCode });
      return x ? true : false;
    } catch (error) {
      return false;
    }
  }
  if (obj.bookingCode) {
    console.log(2);
    try {
      var x = await db
        .getDB()
        .collection("support_record")
        .findOne({ bookingCode: obj.bookingCode });
      return x ? true : false;
    } catch (error) {
      return false;
    }
  }
};

exports.create = async (req, res) => {
  var date = new Date();
  const obj = {
    supporterId: res.locals.userId,
    userCode: req.body.userCode,
    time: date,
    bookingCode: req.body.bookingCode,
    verifyStatus: 0,
    verifyDescription: req.body.verifyDescription,
  };
  var c = await check_for_existence(obj);
  console.log("c", c);
  if (c === true) {
    res.send({
      success: false,
      message: "Phiếu đã được quét",
    });
  } else {
    var _checkUserIsNew = await checkUserIsNew(req, res, obj);
    console.log("object", _checkUserIsNew);

    if (_checkUserIsNew.success === false) {
      res.send({
        success: false,
        message: "Không phải user mới",
      });
    } else {
      const support_record = new Support_record(obj);

      support_record
        .save()
        .then((data) => {
          res.send({ success: true, message: "Thêm thành công !" });
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Note.",
          });
        });
    }
  }
};

exports.findAll = (req, res) => {
  Support_record.find({ supporterId: res.locals.userId }).then((data) => {
    res.send(data).catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving note with id " + req.params.sp_recordId,
      });
    });
  });
};

exports.findOne = (req, res) => {
  var id = req.params.sp_recordId;

  Support_record.find({ supporter: id })
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      res.send(note);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving note with id " + req.params.sp_recordId,
      });
    });
};

exports.update = (req, res) => {
  if (!req.body.content) {
    return res.status(400).send({
      message: "Note content can not be empty",
    });
  }

  Support_record.findByIdAndUpdate(
    req.params.noteId,
    {
      title: req.body.title || "Untitled Note",
      content: req.body.content,
    },
    { new: true }
  )
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      res.send(note);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      return res.status(500).send({
        message: "Error updating note with id " + req.params.sp_recordId,
      });
    });
};

exports.delete = (req, res) => {
  Support_record.findByIdAndRemove(req.params.noteId)
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      res.send({ message: "Note deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.sp_recordId,
        });
      }
      return res.status(500).send({
        message: "Could not delete note with id " + req.params.sp_recordId,
      });
    });
};

exports.demo1 = async (req, res) => {
  var patients = await db.getDB().collection("patients").find().toArray();

  // console.log("patients :>> ", patients);
};
