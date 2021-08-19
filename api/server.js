const express = require("express");
const cors = require("cors");
const V1 = require("./v1/router");

const dotenv = require("dotenv");
dotenv.config();

const server = express();

server.use(express.json());
server.use(cors());

//TODO: add tokens for api
server.use("/v1", V1);

server.listen(8003, () => {
	console.log("listening at http://localhost:8003");
});
