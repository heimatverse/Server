const express = require("express");
const Routes = express.Router();
const {Authentication} = require("../Middleware/JWT")
const { Registration,deleteHome,updateDevice,getHomedata,Addnode,updateroom ,updateuserdata ,deleteRoom,kickuser,Login,deleteDevice, verify ,Homecreate,getUserData,addDevice,addRoom,Home_user,reverify,forgotpassword,Refresh_token} = require("../Controller/controller");



Routes.route("/Register").post(Registration);
Routes.route("/addDevice").post(addDevice);
Routes.route("/addnode").post(Addnode);
Routes.route("/Homecreate").post(Homecreate);
Routes.route("/deleteRoom").post(deleteRoom);
Routes.route("/updateuserdata").post(updateuserdata);
Routes.route("/updateDevice").post(updateDevice);
Routes.route("/updateroom").post(updateroom);
Routes.route("/kickuser").post(kickuser);
Routes.route("/deleteHome").post(deleteHome);
Routes.route("/deleteDevice").post(deleteDevice);
Routes.route("/joinHome").post(Home_user);
Routes.route("/addRoom").post(addRoom);
Routes.route("/verify").get(verify);
Routes.route("/forgotpassword").post(forgotpassword);
Routes.route("/login").post(Login);
Routes.route("/reverify").post(reverify);
Routes.route("/refresh").post(Refresh_token);
Routes.route("/userdata").get(getUserData)
Routes.route("/getHomedata").get(getHomedata);

module.exports = Routes;
