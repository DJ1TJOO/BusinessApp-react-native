const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const sendEmail = require("./helpers/mailer");
const { promisePool: db } = require("./helpers/db");
const { dbGenerateUniqueId } = require("./helpers/utils");

const users = require("express").Router();

// TODO: authorization
users.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		// TODO: fix born date
		const [results] = await db.query(`SELECT id,business_id,right_id,first_name,last_name,email FROM users WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		return res.send({
			success: true,
			data: results[0],
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

users.get("/business/:id", async (req, res) => {
	const { id } = req.params;
	try {
		// TODO: fix born date
		const [results] = await db.query(`SELECT id,business_id,right_id,first_name,last_name,email FROM users WHERE business_id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		return res.send({
			success: true,
			data: results,
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
	const { businessId, rightId, firstName, lastName, email, password, born, functionDescription, sendCreateCode, prefix } = req.body;

	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

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

		const [email_result] = await db.query(`SELECT count(*) FROM users WHERE business_id = ? AND email = ?`, [businessId, email]);

		// User already exists
		if (email_result[0]["count(*)"] > 0) {
			// Return status 409 (conflict) already exists
			return res.status(409).send({
				success: false,
				error: "taken",
				data: {
					field: "email",
				},
			});
		}

		// Check if right is specified
		let hasRight = false;
		if (rightId) {
			const [function_result] = await db.query(`SELECT count(*) FROM rights WHERE id = ?`, [rightId]);

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
		if (firstName.length < 3) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "firstName",
					minLength: 3,
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
		if (lastName.length < 3) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "lastName",
					minLength: 3,
				},
			});
		}

		// Check password
		// Password is empty
		let pwd;
		if (!password && !sendCreateCode) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "password",
				},
			});
		} else if (sendCreateCode) {
			// Hash temp password
			pwd = bcrypt.hashSync(process.env.TEMP_USER_PWD, 12);
		} else {
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
			pwd = bcrypt.hashSync(password, 12);
		}

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
		const id = await dbGenerateUniqueId("users", "id");

		// Insert user into db
		await db.query(
			`INSERT INTO 
					users (id, business_id, ${hasRight ? "right_id," : ""} first_name, last_name,
						email, pwd, born${hasFunctionDescription ? ", function_descr" : ""})
					VALUES ('${escape(id)}', '${escape(businessId)}',${hasRight ? `'${escape(rightId)}',` : ""}'${escape(firstName)}','${escape(lastName)}',
						'${escape(email)}', '${pwd}', '${escape(bornDate.toISOString())}'${hasFunctionDescription ? `,'${escape(functionDescription)}'` : ""})`
		);

		// TODO: fix born date
		const [results] = await db.query(`SELECT id,business_id,right_id,first_name,last_name,email FROM users WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		const user = results[0];
		if (sendCreateCode) {
			// Find code
			let code;
			do {
				code = generateCode(6);
			} while (recoverCodes.find((x) => x.code === code));

			// Date plus twelve hours
			const expirationDate = Date.now() + 12 * 60 * 60 * 1000;

			// Remove code after twelve hours
			setTimeout(() => {
				const index = recoverCodes.findIndex((x) => x.code === code);
				if (index >= 0) {
					recoverCodes.splice(index, 1);
				}
			}, 12 * 60 * 60 * 1000);

			// Datetime
			const date = new Date();

			// Send email
			let html = fs.readFileSync(path.resolve(__dirname, "./mails/createPassword.html"), "utf8");
			html = html.replace("{createCode}", code);
			html = html.replace(/{link}/g, `${prefix}forgotpassword/true/${businessId}/${user.id}/${code}`);
			html = html.replace(/{backuplink}/g, `http://thomasbrants.nl/redirect/?${prefix}forgotpassword/true/${businessId}/${user.id}/${code}`);
			html = html.replace(
				"{date}",
				date.toLocaleDateString(undefined, {
					year: "2-digit",
					month: "2-digit",
					day: "2-digit",
				})
			);
			html = html.replace(
				"{time}",
				date.toLocaleTimeString(undefined, {
					hour: "2-digit",
					minute: "2-digit",
				})
			);
			date.setHours(date.getHours() + 12);
			html = html.replace(
				"{timeAllowed}",
				date.toLocaleTimeString(undefined, {
					hour: "2-digit",
					minute: "2-digit",
				})
			);

			sendEmail(
				{
					from: "Business App <business.app.api@gmail.com>",
					to: email,
					subject: "Creëer wachtwoord",
					html: html,
				},
				(err, info) => {
					if (err) console.log(err);
				}
			);

			// Add code to list
			recoverCodes.push({
				businessId: businessId,
				userId: user.id,
				expirationDate,
				code,
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

/**
 * @type {Array<{
 * 	businessId: string,
 * 	userId: string,
 * 	expirationDate: Date,
 * 	code: number
 * }>}
 */
const recoverCodes = [];

const generateCode = (length) => {
	return Math.random()
		.toString()
		.slice(2, 2 + length);
};

users.get("/recover/:business/:email", async (req, res) => {
	const { business, email } = req.params;

	try {
		// Get business
		const [getBusinessResults] = await db.query(`SELECT id FROM business WHERE name = ?`, [business]);
		if (getBusinessResults.length < 1) {
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if user exists
		const [getUserResults] = await db.query(`SELECT id FROM users WHERE email = ? AND business_id = ?`, [email, getBusinessResults[0].id]);
		if (getUserResults.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		// Find code
		let code;
		do {
			code = generateCode(6);
		} while (recoverCodes.find((x) => x.code === code));

		// Date plus one hour
		const expirationDate = Date.now() + 60 * 60 * 1000;

		// Remove code after one hour
		setTimeout(() => {
			const index = recoverCodes.findIndex((x) => x.code === code);
			if (index >= 0) {
				recoverCodes.splice(index, 1);
			}
		}, 60 * 60 * 1000);

		// Datetime
		const date = new Date();

		// Send email
		let html = fs.readFileSync(path.resolve(__dirname, "./mails/resetPassword.html"), "utf8");
		html = html.replace("{resetCode}", code);
		html = html.replace(
			"{date}",
			date.toLocaleDateString(undefined, {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			})
		);
		html = html.replace(
			"{time}",
			date.toLocaleTimeString(undefined, {
				hour: "2-digit",
				minute: "2-digit",
			})
		);
		date.setHours(date.getHours() + 1);
		html = html.replace(
			"{timeAllowed}",
			date.toLocaleTimeString(undefined, {
				hour: "2-digit",
				minute: "2-digit",
			})
		);

		sendEmail(
			{
				from: "Business App <business.app.api@gmail.com>",
				to: email,
				subject: "Reset wachtwoord",
				html: html,
			},
			(err, info) => {
				if (err) console.log(err);
			}
		);

		// Add code to list
		recoverCodes.push({
			businessId: getBusinessResults[0].id,
			userId: getUserResults[0].id,
			expirationDate,
			code,
		});

		res.status(200).send({
			success: true,
			data: {
				businessId: getBusinessResults[0].id,
				userId: getUserResults[0].id,
			},
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

users.post("/recover/:businessId/:userId/:code", async (req, res) => {
	const { businessId, userId, code } = req.params;
	const { newPassword } = req.body;

	// Check if code exists
	const index = recoverCodes.findIndex((x) => x.code === code);
	if (index < 0) {
		return res.status(404).send({
			success: false,
			error: "code_not_found",
		});
	}

	// Remove recover codes
	const set = recoverCodes.splice(index, 1)[0];

	// Check if businessId is correct
	if (!businessId) {
		return res.status(404).send({
			success: false,
			error: "empty",
			data: {
				field: "businessId",
			},
		});
	}

	// Business id incorrect
	if (businessId !== set.businessId) {
		return res.status(404).send({
			success: false,
			error: "incorrect",
			data: {
				field: "businessId",
			},
		});
	}

	// Check if userId is correct
	if (!userId) {
		return res.status(404).send({
			success: false,
			error: "empty",
			data: {
				field: "userId",
			},
		});
	}

	// User id incorrect
	if (userId !== set.userId) {
		return res.status(404).send({
			success: false,
			error: "incorrect",
			data: {
				field: "userId",
			},
		});
	}

	// Check expired
	if (set.expirationDate < Date.now()) {
		// Expired code
		return res.status(498).send({
			success: false,
			error: "expired",
			data: {
				field: "code",
			},
		});
	}

	// Control request
	if (!newPassword) {
		// Readd code
		recoverCodes.push(set);

		return res.send({
			success: true,
		});
	}

	// Invalid password
	if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_-])(?=.{8,})/.test(newPassword)) {
		// Readd code
		recoverCodes.push(set);

		// Return status 422 (unprocessable entity) incorrect
		return res.status(422).send({
			success: false,
			error: "incorrect",
			data: {
				field: "newPassword",
			},
		});
	}

	// Hash new password
	pwd = bcrypt.hashSync(newPassword, 12);

	try {
		// Insert user into db
		await db.query(
			`UPDATE 
					users
					SET pwd = ?
					WHERE id = ?`,
			[pwd, set.userId]
		);

		// TODO: fix born date
		const [results] = await db.query(`SELECT id,business_id,right_id,first_name,last_name,email FROM users WHERE id = ?`, [set.userId]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return res.send({
			success: true,
			data: results[0],
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

users.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const { rightId, firstName, lastName, email, born, functionDescription, password, newPassword } = req.body;

	try {
		// Get user
		// TODO: fix born date
		const [getResults] = await db.query(`SELECT * FROM users WHERE id = ?`, [id]);
		if (getResults.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		const currentUser = getResults[0];

		// Check if password is specified
		let hasPassword = false;
		let pwd;
		if (newPassword) {
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

			if (password !== newPassword) {
				// Current password not correct
				if (!bcrypt.compareSync(password, currentUser.pwd)) {
					// Return status 401 (unauthorized) incorrect
					return res.status(401).send({
						success: false,
						error: "incorrect",
						data: {
							field: "password",
						},
					});
				}

				// Invalid password
				if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_-])(?=.{8,})/.test(newPassword)) {
					// Return status 422 (unprocessable entity) incorrect
					return res.status(422).send({
						success: false,
						error: "incorrect",
						data: {
							field: "newPassword",
						},
					});
				}

				// Hash new password
				pwd = bcrypt.hashSync(newPassword, 12);

				hasPassword = true;
			}
		}

		// Check if email is specified
		let hasEmail = false;
		if (email && currentUser.email !== email) {
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

			const [email_result] = await db.query(`SELECT count(*) FROM users WHERE business_id = ? AND email = ?`, [currentUser.business_id, email]);

			// User already exists
			if (email_result[0]["count(*)"] > 0) {
				// Return status 409 (conflict) already exists
				return res.status(409).send({
					success: false,
					error: "taken",
					data: {
						field: "email",
					},
				});
			}

			hasEmail = true;
		}

		// Check if right is specified
		let hasRight = false;
		if (rightId && currentUser.right_id !== rightId) {
			const [function_result] = await db.query(`SELECT count(*) FROM rights WHERE id = ?`, [rightId]);

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

		// Check if first name is specified
		let hasFirstName = false;
		if (firstName && currentUser.first_name !== firstName) {
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
			if (firstName.length < 3) {
				// Return status 422 (unprocessable entity) too short
				return res.status(422).send({
					success: false,
					error: "too_short",
					data: {
						field: "firstName",
						minLength: 3,
					},
				});
			}
			hasFirstName = true;
		}

		// Check if last name is specified
		let hasLastName = false;
		if (lastName && currentUser.last_name !== lastName) {
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
			if (lastName.length < 3) {
				// Return status 422 (unprocessable entity) too short
				return res.status(422).send({
					success: false,
					error: "too_short",
					data: {
						field: "lastName",
						minLength: 3,
					},
				});
			}
			hasLastName = true;
		}

		// Check if function description is specified
		let hasFunctionDescription = false;
		if (functionDescription && currentUser.function_description !== functionDescription) {
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

		// Check if born is specified
		let hasBorn = false;
		let bornDate = null;
		if (born) {
			try {
				bornDate = new Date(born);
				currentBornDate = new Date(currentUser.born);

				// Not same date
				if (
					!(
						bornDate.getUTCFullYear() === currentBornDate.getFullYear() &&
						bornDate.getUTCMonth() === currentBornDate.getMonth() &&
						bornDate.getUTCDate() === currentBornDate.getDate()
					)
				) {
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
					hasBorn = true;
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
		}

		// Nothing changed
		if (!hasEmail && !hasRight && !hasFirstName && !hasLastName && !hasFunctionDescription && !hasBorn && !hasPassword) {
			// Send current user
			const { pwd, ...user } = currentUser;
			return res.send({
				success: true,
				data: user,
			});
		}

		const update = [];
		if (hasRight) update.push({ name: "right_id", value: escape(rightId) });
		if (hasFirstName) update.push({ name: "first_name", value: escape(firstName) });
		if (hasLastName) update.push({ name: "last_name", value: escape(lastName) });
		if (hasEmail) update.push({ name: "email", value: escape(email) });
		if (hasBorn) update.push({ name: "born", value: escape(born) });
		if (hasFunctionDescription) update.push({ name: "function_descr", value: escape(functionDescription) });
		if (hasPassword) update.push({ name: "pwd", value: pwd });

		// Update user
		await db.query(
			`UPDATE 
					users
					SET ${update.map((x) => `${x.name} = '${x.value}'`).join(",")}
					WHERE id = '${id}'`
		);

		// TODO: fix born date
		const [results] = await db.query(`SELECT id,business_id,right_id,first_name,last_name,email FROM users WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return res.send({
			success: true,
			data: results[0],
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
		// TODO: fix born date
		const [get_results] = await db.query(`SELECT id,business_id,right_id,first_name,last_name,email FROM users WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM users WHERE id = ?`, [id]);

		if (delete_results.affectedRows < 1) {
			return res.send({
				success: false,
				error: "failed_to_delete",
			});
		}

		return res.send({
			success: true,
			data: get_results[0],
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
