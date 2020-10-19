const mongoose = require('mongoose');

const CheckSchema = mongoose.Schema({

    partnerId: String,
    userId: String,
    locationData: String,
    locationDetail: String,
    time: {
        type: Date,
        default: Date.now()
     },
    action: Number ,
    conditions: String,
    token: String
});

module.exports = mongoose.model('checktimes', CheckSchema,'checktimes');