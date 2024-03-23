const express = require("express");
const Routes = express.Router();
const {Authentication} = require("../Middleware/JWT")
const { Registration, Login, verify ,Homecreate,getUserData,addDevice,addRoom,Home_user} = require("../Controller/controller");



Routes.route("/Register").post(Registration);
// Routes.route("/AddDevice").post(Authentication,Device);
Routes.route("/addDevice").post(addDevice);
Routes.route("/Homecreate").post(Homecreate);
Routes.route("/Home_user").post(Home_user);
Routes.route("/addRoom").post(addRoom);
Routes.route("/verify").get(verify);
// Routes.route("/userdata").get(userdata);
Routes.route("/login").get(Login);
Routes.route("/userdata").get(getUserData)

module.exports = Routes;
