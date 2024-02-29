const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/Heimatverse/",require("./Routes/routes"))

const dbURI =  "mongodb+srv://guddu:guddu@cluster1.ved7bni.mongodb.net/yes?retryWrites=true&w=majority";
mongoose.connect(dbURI ,{useNewUrlParser : true , useUnifiedTopology: true})
.then((result)=>{const PORT = process.env.PORT || 8888;
    app.listen(PORT, ()=>{
        console.log("server is created")
    })})
.catch((err)=>console.log(err))      