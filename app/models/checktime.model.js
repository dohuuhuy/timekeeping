const mongoose = require("mongoose");

const CheckSchema = mongoose.Schema({
  partnerId: String,
  locationId: String,
  locationDetail: Object,
  workshipId: String,
  workshipDetail: Object,
  userId: String,
  latitude: String,
  longitude: String,
  action: {
    type: String,
    default: 0,
  }, // 0 checkin, 1 checkout
  wifiDetail: Object,
  time: {
    type: Date,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("checktimes", CheckSchema, "checktimes");
