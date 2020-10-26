const Support_record = require("../models/support_record.model");
const moment = require("moment");
const axios = require("axios");

checkUserIsNew = async (req, res) => {
  try {
    var dta = await axios.get(
      "https://medpro-api-v2-testing.medpro.com.vn/booking-gateway/get-booking-by-transaction-code?transactionId=VPDev201021CCLNJOQPYFEL"
    );
    let data = dta.data;
    var x1 = data.bookingInfo.createdAt;
  
    var y1 = new Date();
    var x = moment(x1);
    var y = moment(x1);
    var diffInMinutes = y.diff(x, "minutes");
    var listBook = 1;
  
    console.log("data.bookingInfo.createdAt :>> ", x);
    console.log("curent time                :>> ", y);
    console.log("thời gian tạo :>> ", diffInMinutes, "phút trước");
    console.log("Mã bệnh nhân :>> ", data.patientInfo.code);
    console.log("Mã phiếu khám :>> ", data.bookingInfo.bookingCode);
  
    if (diffInMinutes > 10) {
      console.log("--> phiếu đã tạo", diffInMinutes, "phút trước");
      res.send({ success: false, message: "Phiếu đã tạo " + diffInMinutes + " phút trước" });
      //  return {success: false, message:"Phiếu đã tạo" + diffInMinutes + "phút trước"};
    }
    if (listBook != 1) {
      res.send({ success: false, message: "List > 1 " });
      //  return {success: false, message:"List > 1 "}
    }
    else {
  
      return { success: true, message: "Thành công", }
    }
  
    handleClearData();
  } catch (error) {
    return { success: false};
  }

}

exports.create = async (req, res) => {
  var date = new Date();

  var _checkUserIsNew = await checkUserIsNew(req, res);
  if (_checkUserIsNew.success === false) {
    res.send({ success: false, message: "không co dữ liệu để kiểm tra" });
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
        res.send({ success: true, message: "post thành công !", data: data });
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
  })



};

exports.findOne = (req, res) => {
  var id = req.params.sp_recordId;

  Support_record
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

  Support_record
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
  Support_record
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
