const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    createTime: {
        type: Date,
        default: Date.now
    },
    partnerId: String,
    code: String,
    shiftId: Number,
    shiftName: String,
    fromTime: String,
    toTime: String,
    customSlot: String,
    days: String,
    type: String

});

module.exports = mongoose.model('schedules', NoteSchema,'schedules' );
