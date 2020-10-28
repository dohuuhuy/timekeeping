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

checkUserIsNew = async (req, res) => {
  var data = req.body;
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
      return { success: false, message: "Thời gian" };
    }
    if (listBookings > 1) {
      return { success: false, message: "Số lượng" };
    }
    return { success: true, message: "User mới" };
    } catch (error) {
      return { success: false, message: "Không tìm thấy bookingCode" };
    }
  
  }

  if (data.userCode) {
    var code = data.userCode;

    try {
      var patients = await db
        .getDB()
        .collection("patients")
        .find({ code: code })
        .toArray();

      console.log("patients :>> ", patients);
      var userId = patients[0].userId;
      var createdAt = patients[0].createdAt;

      var users = await db
        .getDB()
        .collection("users")
        .find({ _id: userId })
        .toArray();

      console.log("Tìm_users :>> ", users);
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
        return { success: false, message: "Số lượng" };
      }
      if (diffInMinutes > 10) {
        return { success: false, message: "Thời gian" };
      }
      return { success: true, message: "User mới" };
    } catch (error) {
          //  res.send({ success: false, message: "Dữ liệu không hợp lệ" });
      return { success: false, message: "Không tìm thấy userCode !" };
    }
  } else {
      //  res.send({ success: false, message: "Dữ liệu không hợp lệ" });
    return { success: false, message: "Dữ liệu không hợp lệ !" };
  }
};

exports.create = async (req, res) => {
  var date = new Date();

  var _checkUserIsNew = await checkUserIsNew(req, res);
  console.log("object", _checkUserIsNew);

  if (_checkUserIsNew.success === false) {
    res.send({ success: false, message: _checkUserIsNew.message});
  } else {
    const support_record = new Support_record({
      supporterId: req.body.supporterId,
      userCode: req.body.userCode,
      time: date,
      bookingCode: req.body.bookingCode,
      verifyStatus: 0,
      verifyDescription: req.body.verifyDescription,
    });

    support_record
      .save()
      .then((data) => {
        res.send({ success: true, message: "Thêm thành công !", data: data });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Note.",
        });
      });
  }
};

exports.findAll = (req, res) => {
  Support_record.find({}).then((data) => {
    res.send(data);
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
