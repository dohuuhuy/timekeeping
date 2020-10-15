const mongoose = require('mongoose');

const CheckSchema = mongoose.Schema({
    locationData: String,
    locationDetail: String,
    time: {
        type: Date,
        default: Date.now()
     },
    action: Boolean  
});

module.exports = mongoose.model('checktimes', CheckSchema,'checktimes');