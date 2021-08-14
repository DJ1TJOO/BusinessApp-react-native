const mysql = require("mysql2");

const pool = mysql.createPool({
	host: "localhost",
	user: "root",
	database: "business_api",
	dateStrings: true,
});

const promisePool = pool.promise();

module.exports = { pool, promisePool, escape: mysql.escape };
