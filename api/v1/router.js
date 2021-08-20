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
const { isObject, toCamel } = require("./helpers/utils");

// Add middleware to make all data camel cased
V1.use((req, res, next) => {
	const send = res.send;
	res.send = function (body) {
		res.send = send;

		if (body && isObject(body) && body.data && body.camel !== false) {
			body.data = toCamel(body.data);
		} else if (body.camel === false) {
			const { camel, ...bodyToSend } = body;
			body = bodyToSend;
		}

		res.send(body);
	};

	next();
});

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
