const mongoose = require("mongoose");

const CheckSchema = mongoose.Schema({
  partnerId: String,
  locationId: String,
  workshipId: String,
  userId:  String,
  latitude: String,
  longitude: String,
  action: Number,
 
  time: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
   
  },
});

module.exports = mongoose.model("checktimes", CheckSchema, "checktimes");
