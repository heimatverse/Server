const mongoose = require("mongoose");

const RoomIdSchema = new mongoose.Schema({
    Room_Name: { type: String },
    Devices_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device-data'
    }],
    Home_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home_schema'
    }

});

const Room = mongoose.model('Room-data', RoomIdSchema); 
module.exports = Room;
