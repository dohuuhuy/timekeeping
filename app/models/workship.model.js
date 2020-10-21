const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
   
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
    createTime: {
        type: Date,
        default: Date.now
    },
    

});

module.exports = mongoose.model("work_schedules", NoteSchema, "work_schedules");
