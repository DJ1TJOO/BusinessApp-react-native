const { promisePool: db } = require("./db");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

const users = require("express").Router();

// TODO: authorization
users.get("/:id", async (req, res) => {
	const { id, businessId } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM users WHERE id = '${id}'`);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		const { pwd: hashed, ...user } = results[0];
		return res.send({
			success: true,
			data: user,
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});

users.post("/", async (req, res) => {
	const { businessId, rightId, firstName, lastName, email, password, born, functionDescription } = req.body;

	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = '${businessId}'`);

		// Busines does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) business not found
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if email is email
		// Email is empty
		if (!email) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "email",
				},
			});
		}

		// Not an email
		if (
			!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
				email
			)
		) {
			// Return status 422 (unprocessable entity) incorrect
			return res.status(422).send({
				success: false,
				error: "incorrect",
				data: {
					field: "email",
				},
			});
		}

		// Email too long
		if (email.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "email",
					maxLength: 255,
				},
			});
		}

		const [email_result] = await db.query(`SELECT count(*) FROM users WHERE business_id = '${businessId}' AND email = '${email}'`);

		// User already exists
		if (email_result[0]["count(*)"] > 0) {
			// Return status 409 (conflict) already exists
			return res.status(409).send({
				success: false,
				error: "user_exists",
			});
		}

		// Check if right is specified
		let hasRight = false;
		if (rightId) {
			const [function_result] = await db.query(`SELECT count(*) FROM rights WHERE id = '${rightId}'`);

			// Right does not exists
			if (function_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) right not found
				return res.status(404).send({
					success: false,
					error: "right_not_found",
				});
			}

			hasRight = true;
		}

		// Check if first name is correct
		// First name is empty
		if (!firstName) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "firstName",
				},
			});
		}

		// First name too long
		if (firstName.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "firstName",
					maxLength: 255,
				},
			});
		}

		// First name too short
		if (firstName.length < 6) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "firstName",
					minLength: 6,
				},
			});
		}

		// Check if last name is correct
		// Last name is empty
		if (!lastName) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "lastName",
				},
			});
		}

		// Last name too long
		if (lastName.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "lastName",
					maxLength: 255,
				},
			});
		}

		// Last name too short
		if (lastName.length < 6) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "lastName",
					minLength: 6,
				},
			});
		}

		// Check password
		// Password is empty
		if (!password) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "password",
				},
			});
		}

		// Password too long
		if (password.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "password",
					maxLength: 255,
				},
			});
		}

		// Password too short
		if (password.length < 8) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "password",
					minLength: 8,
				},
			});
		}

		// Invalid password
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_-])(?=.{8,})/.test(password)) {
			// Return status 422 (unprocessable entity) incorrect
			return res.status(422).send({
				success: false,
				error: "incorrect",
				data: {
					field: "password",
				},
			});
		}

		// Hash password
		const pwd = bcrypt.hashSync(password, 12);

		// Check if function description is specified
		let hasFunctionDescription = false;
		if (functionDescription) {
			// Function description too long
			if (functionDescription.length > 255) {
				// Return status 422 (unprocessable entity) too long
				return res.status(422).send({
					success: false,
					error: "too_long",
					data: {
						field: "functionDescription",
						maxLength: 255,
					},
				});
			}

			hasFunctionDescription = true;
		}

		// Check born
		// born is empty
		if (!born) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "born",
				},
			});
		}

		let bornDate = null;
		try {
			bornDate = new Date(born);

			const ageDiffMilliseconds = Date.now() - bornDate.getTime();
			const ageDate = new Date(ageDiffMilliseconds);
			const age = Math.abs(ageDate.getUTCFullYear() - 1970);

			// Invalid age
			if (age < 18) {
				// Return status 422 (unprocessable entity) invalid
				return res.status(422).send({
					success: false,
					error: "invalid",
					data: {
						field: "born",
					},
				});
			}
		} catch (error) {
			// Return status 422 (unprocessable entity) incorrect
			return res.status(422).send({
				success: false,
				error: "incorrect",
				data: {
					field: "born",
				},
			});
		}

		// Generate id
		let id;
		let id_results;
		do {
			id = uuid();
			[id_results] = await db.query(`SELECT count(*) FROM users WHERE id = '${id}'`);
		} while (id_results[0]["count(*)"] > 0);

		// Insert user into db
		await db.query(
			`INSERT INTO 
                    users (id, business_id, ${hasRight ? "rightId," : ""} first_name, last_name, 
							email, pwd, born${hasFunctionDescription ? ", function_descr" : ""})
                    VALUES ('${id}', '${businessId}',${hasRight ? `'${rightId}',` : ""}'${firstName}','${lastName}',
							'${email}', '${pwd}', '${born}'${hasFunctionDescription ? `,'${functionDescription}'` : ""})`
		);

		const [results] = await db.query(`SELECT * FROM users WHERE id = '${id}'`);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}
		const { pwd: hashed, ...user } = results[0];
		return res.send({
			success: true,
			data: user,
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});

users.delete("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM users WHERE id = '${id}'`);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		const { pwd: hashed, ...user } = get_results[0];

		const [delete_results] = await db.query(`DELETE FROM users WHERE id = '${id}'`);

		if (delete_results.affectedRows < 1) {
			return res.send({
				success: false,
				error: "failed_to_delete",
			});
		}

		return res.send({
			success: true,
			data: user,
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});

module.exports = users;
