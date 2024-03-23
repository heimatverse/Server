const mongoose = require("mongoose");
const DeviceSchema = new mongoose.Schema({
    Device_name:{type:String},
    Device_meta:{type:String},
    
});

const Device = mongoose.model('Device-data', DeviceSchema);
module.exports = Device;