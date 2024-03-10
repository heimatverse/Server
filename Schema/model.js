
const mongoose = require("mongoose");

const Device = mongoose.Schema({
    Device_Name: { type: String },
    Room_ID: { type: String }
});

const schema = mongoose.Schema({
    Name: { type: String, required: true },
    Password: { type: String, required: true },
    PhoneNumber: { type: Number, required: true },
    Email: { type: String, required: true },
    Device: [Device],
    Topics: [String],
    Verified: {
        type: Boolean,
        default: false
    },
    Subscription: [String]

});

const reg = mongoose.model('Heimatverse-data', schema);
module.exports = reg;