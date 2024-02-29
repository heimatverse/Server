const mongoose = require("mongoose");
const schema = mongoose.Schema({
    Name :{type:String,required:true},
    Password:{type:String,required:true},
    PhoneNumber:{type:Number,required:true},
    Email:{type:String,required:true}
})

const reg = mongoose.model('Heimatverse-data',schema);
module.exports = reg; 