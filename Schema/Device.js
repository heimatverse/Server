const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
    Device_name:{type:String},
    Device_meta:{type:String},
    Room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room-data'
    }
    
});

const Device = mongoose.model('Device-data', DeviceSchema);
module.exports = Device;