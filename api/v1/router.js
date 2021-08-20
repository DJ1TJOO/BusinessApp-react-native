const V1 = require("express").Router();

const users = require("./users");
const login = require("./login");
const business = require("./business");
const hours = require("./hours");
const teams = require("./teams");
const rights = require("./rights");
const chats = require("./chats");

const images = require("./helpers/images");

const analytics = require("./analytics");

V1.get("/", (req, res) => res.send({ success: true }));

V1.use("/analytics", analytics);

V1.use("/images", images.router);

V1.use("/users", users);
V1.use("/login", login);
V1.use("/business", business);
V1.use("/hours", hours);
V1.use("/teams", teams);
V1.use("/rights", rights);
V1.use("/chats", chats);

module.exports = V1;
