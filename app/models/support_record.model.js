const db = require("mongoose");

const support_recordChema = db.Schema({
  supporterId: String,
  userId: String,
  time: {
    type: Date,
    default: Date.now(),
  },
  bookingCode: String,
  verifyStatus: Number, // 0-success  1-fail
  verifyDescription: String,
});

module.exports = db.model(
  "support_record",
  support_recordChema,
  "support_record"
);
