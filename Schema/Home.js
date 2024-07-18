const mongoose = require("mongoose");

const HomeSchema = new mongoose.Schema({
    Home_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'new_Heimatverse-data'
    },
    HomeName: {
        type: String,
        required: true
    },
    Topic:{
        type:String
    },
    Admin_ID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'new_Heimatverse-data'
    }],
    User_ID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'new_Heimatverse-data'
    }],
    Room_ID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room-data'
    }],
    SS_id: [{
        type: String
    }]
});

// Create model from HomeSchema
const Home = mongoose.model('Home_schema', HomeSchema);
module.exports = Home;


