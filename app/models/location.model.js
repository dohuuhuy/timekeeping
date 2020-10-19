const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  createTime: {
    type: Date,
    default: Date.now,
  },
  partnerId: String,
  name: String,
  address: String,
  status: Boolean,
  latitude: String,
  longitude: String,
});

module.exports = mongoose.model(
  "work_locations",
  locationSchema,
  "work_locations"
);
