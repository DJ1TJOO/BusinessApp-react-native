const V1 = require("express").Router();
const users = require("./users");

V1.use("/users", users);

module.exports = V1;
