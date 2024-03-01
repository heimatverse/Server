const express = require("express");
const Routes = express.Router();
const {Authentication} = require("../Middleware/JWT")
const {Registration,Login,data,Device} = require("../Controller/controller");



Routes.route("/Register").post(Registration);
Routes.route("/AddDevice").post(Authentication,Device);
Routes.route("/data").get(Authentication,data);
Routes.route("/login").get(Login);

module.exports = Routes;
