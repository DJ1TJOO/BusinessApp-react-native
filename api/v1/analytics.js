const analytics = require("express").Router();

analytics.post("/error", (req, res) => {
	// TODO: handle error log
	res.sendStatus(200);
});

module.exports = analytics;
