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
  action: Number,
  wifiDetail: Object,
  time: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model("checktimes", CheckSchema, "checktimes");
