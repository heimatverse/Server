const express = require("express");
const Routes = express.Router();
const {Authentication} = require("../Middleware/JWT")
const { Registration, Login, verify ,Homecreate,getUserData,addDevice,addRoom,Home_user,reverify,forgotpassword} = require("../Controller/controller");



Routes.route("/Register").post(Registration);
Routes.route("/addDevice").post(Authentication,addDevice);
Routes.route("/Homecreate").post(Authentication,Homecreate);
Routes.route("/Home_user").post(Authentication,Home_user);
Routes.route("/addRoom").post(Authentication,addRoom);
Routes.route("/verify").get(verify);
Routes.route("/forgotpassword").post(forgotpassword);
Routes.route("/login").post(Login);
Routes.route("/reverify").post(reverify);
Routes.route("/userdata").get(Authentication,getUserData)

module.exports = Routes;
