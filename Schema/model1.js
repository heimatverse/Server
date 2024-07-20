const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    Name: { type: String, required: true },
    Password: { type: String, required: true },
    Address: { type: String, required: true },
    PhoneNumber: { type: String, required: true },
    Email: { type: String, required: true,unique:true },
    Verified: {
        type: Boolean,
        default: false
    },
    Home_Id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home_schema',
        default:null
    },
    Subscription: [String],
    Refreshtoken:{type:String},
    Join_ID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Join_Schema'
    }]
});

const reg = mongoose.model('new_Heimatverse-data', schema);
module.exports = reg;
