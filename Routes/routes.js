const express = require("express");
const Routes = express.Router();
const {Authentication} = require("../Middlerware/JWT");
const {Registration,Login,data} = require("../Controller/controller");



Routes.route("/Register").post(Registration);
// here is example how to use JWT auth
// Routes.route("/data").get(Authentication,data);
Routes.route("/login").get(Login);

module.exports = Routes;
