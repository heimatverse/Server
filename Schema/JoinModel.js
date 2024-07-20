const  mongoose = require('mongoose')

const JoinSchema = new mongoose.Schema([{
    homeID : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home_schema'
    },
    Home_Name : {
        type: String
    },
    isAdmin : {
        type: Boolean,
        default: false
    }
}]);

const JoinModel = mongoose.model("Join_Schema", JoinSchema)
module.exports = JoinModel;