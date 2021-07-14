const V1 = require("express").Router();
const user = require("./user");

V1.use("user", user);

module.exports = V1;
