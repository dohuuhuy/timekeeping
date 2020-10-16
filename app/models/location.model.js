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
});

module.exports = mongoose.model("locations", locationSchema, "locations");
