const express = require("express");
const V1 = require("./v1/router");

const server = express();

server.use("v1", V1);

server.listen(8003, () => {
	console.log("listening at http://localhost:8003");
});
