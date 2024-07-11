const mongoose = require("mongoose");
const NodeSchema =  new mongoose.Schema({
    type:{type:String},
    Name:{type:String},
    Icon:{type:String},
    Device_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device-data'
    }
})

const Node = mongoose.model('Node-data',NodeSchema);
module.exports = Node;

