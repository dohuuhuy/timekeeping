const support_record = require("../models/support_record.model");
const moment = require("moment");
exports.create = (req, res) => {
  // Validate request
  //  if(!req.body.content) {
  //     return res.status(400).send({
  //         message: "Note content can not be empty"
  //     });
  // }

  var date = new Date();
  var curDate = moment(date).format("YYYY-MM-DD HH:mm:ss");

  console.log("curDate :>> ", curDate);

  const note = new support_record({
    supporterId: req.body.supporterId,
    userCode: req.body.userCode,
    time: date,
    bookingCode: req.body.bookingCode,
    verifyStatus: req.body.verifyStatus,
    verifyDescription: req.body.verifyDescription,
  });

  note
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Note.",
      });
    });
};

exports.findAll = async (req, res) => {
  const axios = require("axios");
  const moment = require("moment");

  var dta = await axios.get(
    "https://medpro-api-v2-testing.medpro.com.vn/booking-gateway/get-booking-by-transaction-code?transactionId=VPDev201021CCLNJOQPYFEL"
  );

  let data = dta.data;
  var x1 = data.bookingInfo.createdAt;
  var y1 = new Date();
  var x = moment(x1);
  var y = moment(y1);

  console.log("data.bookingInfo.createdAt :>> ", x);
  console.log("curent time                :>> ", y);

  var diffInMinutes = y.diff(x, "minutes");
  console.log("thời gian tạo :>> ", diffInMinutes, "phút trước");

  if (diffInMinutes <= 10) {
    console.log("--> phiếu tạo trong 10 phút");
  } else {
    console.log("--> phiếu đã tạo", diffInMinutes, "phút trước");
  }

  console.log("Mã bệnh nhân :>> ", data.patientInfo.code);
  console.log("Mã phiếu khám :>> ", data.bookingInfo.bookingCode);

  var x = await support_record.find({});
  console.log("x :>> ", x);
    

};

exports.findOne = (req, res) => {
  var id = req.params.sp_recordId;

  support_record
    .find({ supporter: id })
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

  support_record
    .findByIdAndUpdate(
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
  support_record
    .findByIdAndRemove(req.params.noteId)
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
