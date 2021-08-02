const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { promisePool: db } = require("./helpers/db");

const login = require("express").Router();

login.post("/", async (req, res) => {
	const { business, email, password } = req.body;
	try {
		const [business_results] = await db.query(`SELECT id FROM business WHERE name = ?`, [business]);
		if (business_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		const [results] = await db.query(`SELECT id, pwd FROM users WHERE email = ? AND business_id = ?`, [email, business_results[0].id]);
		if (results.length < 1) {
			return res.status(401).send({
				success: false,
				error: "invalid_credentials",
			});
		}

		const user = results[0];
		if (!bcrypt.compareSync(password, user.pwd)) {
			return res.status(401).send({
				success: false,
				error: "invalid_credentials",
			});
		}

		const token = jwt.sign({ id: user.id, email: email, business: business_results[0].id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.send({
			success: true,
			data: {
				token,
				user: { id: user.id, email: email, business: business_results[0].id },
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

module.exports = login;
