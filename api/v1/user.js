const db = require("./db");
const user = require("express").Router();

user.post("/", (req, res) => {
	const { businessId, functionId, firstName, lastName, email, password, birthDate, functionDescription } = req.body;

	//TODO: check values
	//TODO: encrypt password

	// Check if user with email already exists
	db.query(`SELECT * FROM users WHERE business_id = '${businessId}' AND email = '${email}'`, (err, result, fields) => {
		// Mysql error
		if (err) {
			// Return status 500 (internal server error) mysql error
			return res.status(500).send({
				success: false,
				error: "mysql_error",
			});
		}

		// User already exists
		if (result.length > 0) {
			// Return status 409 (conflict) already exists
			return res.status(409).send({
				success: false,
				error: "user_with_email_exists",
			});
		}

		// Insert user into db
		db.query(
			`INSERT INTO 
                    users (business_id, function_id, first_name, last_name, email, pwd, birth_date, function_descr)
                    VALUES ('${businessId}','${functionId}','${firstName}','${lastName}','${email}', '${password}', '${birthDate}', '${functionDescription}')`,
			(err, result, fields) => {}
		);
	});
});

module.exports = user;
