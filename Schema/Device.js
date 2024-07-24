const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
    Device_name:{type:String},
    Device_meta:{type:String},
    ip_address: {type:String},
    mac_address: {type: String},
    Room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room-data'
    },
    Node_id:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node-data'
    }]
    
});

const Device = mongoose.model('Device-data', DeviceSchema);
module.exports = Device;