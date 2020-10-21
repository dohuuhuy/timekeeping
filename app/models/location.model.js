const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  
  locationId: String,
  partnerId: String,
  name: String,
  address: String,
  status: Number,
  latitude: String,
  longitude: String,
  createTime: {
    type: Date,
    default: Date.now,
  },
  condition :  {
    type: Number,
    default: 1
},
});

module.exports = mongoose.model(
  "work_locations",
  locationSchema,
  "work_locations"
);
