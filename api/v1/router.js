const V1 = require("express").Router();

const users = require("./users");
const login = require("./login");
const business = require("./business");
const hours = require("./hours");
const teams = require("./teams");
const rights = require("./rights");

const images = require("./helpers/images");

V1.use("/images", images.router);

V1.use("/users", users);
V1.use("/login", login);
V1.use("/business", business);
V1.use("/hours", hours);
V1.use("/teams", teams);
V1.use("/rights", rights);

module.exports = V1;
