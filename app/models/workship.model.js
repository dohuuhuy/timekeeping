const mongoose = require("mongoose");

const workshipSchema = mongoose.Schema({
  partnerId: String,
  locationId: String,
  workshipId: String,
  code: String,
  shiftId: Number,
  shiftName: String,
  fromTime: String,
  toTime: String,
  customSlot: String,
  days: String,
  type: String,
  status: Number,
  isRequireChecking: String,
  timeType: String,
  createTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "work_schedules",
  workshipSchema,
  "work_schedules"
);
