const V1 = require("express").Router();

const users = require("./users");
const business = require("./business");

const images = require("./helpers/images");

V1.use("/images", images.router);

V1.use("/users", users);
V1.use("/business", business);

module.exports = V1;
