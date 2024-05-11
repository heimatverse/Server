const express = require("express");
const Routes = express.Router();
const {Authentication} = require("../Middleware/JWT")
const { Registration,deleteHome, kickuser,Login, verify ,Homecreate,getUserData,addDevice,addRoom,Home_user,reverify,forgotpassword,Refresh_token} = require("../Controller/controller");



Routes.route("/Register").post(Registration);
Routes.route("/addDevice").post(Authentication,addDevice);
Routes.route("/Homecreate").post(Homecreate);
Routes.route("/kickuser").post(Authentication,kickuser);
Routes.route("/deleteHome").post(Authentication,deleteHome);
Routes.route("/Home_user").post(Authentication,Home_user);
Routes.route("/addRoom").post(Authentication,addRoom);
Routes.route("/verify").get(verify);
Routes.route("/forgotpassword").post(forgotpassword);
Routes.route("/login").post(Login);
Routes.route("/reverify").post(reverify);
Routes.route("/refresh").post(Refresh_token);
Routes.route("/userdata").get(Authentication,getUserData)

module.exports = Routes;
