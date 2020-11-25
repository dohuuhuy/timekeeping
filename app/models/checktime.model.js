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
  action: Number, // 1 checkin, 0 checkout
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
