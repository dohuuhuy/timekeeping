const db = require("mongoose");

const support_recordChema = db.Schema({
  supporterId: String,
  userCode: String,
  time: {
    type: Date,
    default: Date.now(),
  },
  bookingCode: String,
  verifyStatus: {
    type: Number,
    default: 1,
  }, // 0-success  1-fail
  verifyDescription: String,
});

module.exports = db.model(
  "support_record",
  support_recordChema,
  "support_record"
);
