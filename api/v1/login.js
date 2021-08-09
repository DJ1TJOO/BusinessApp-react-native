const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authToken = require("./helpers/auth");

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

		const [results] = await db.query(`SELECT * FROM users WHERE email = ? AND business_id = ?`, [email, business_results[0].id]);
		if (results.length < 1) {
			return res.status(401).send({
				success: false,
				error: "invalid_credentials",
			});
		}

		const { pwd, ...user } = results[0];
		if (!bcrypt.compareSync(password, pwd)) {
			return res.status(401).send({
				success: false,
				error: "invalid_credentials",
			});
		}

		const token = jwt.sign({ id: user.id, email: user.email, businessId: business_results[0].id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.send({
			success: true,
			data: {
				token,
				user: { ...user, businessId: business_results[0].id },
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

login.post("/validate", authToken, async (req, res) => {
	const token = jwt.sign(req.token, process.env.JWT_SECRET, {
		expiresIn: "1d",
	});

	const [results] = await db.query(`SELECT * FROM users WHERE id = ?`, [req.token.id]);
	if (results.length < 1) {
		return res.send({
			success: true,
			data: {
				token,
				user: null,
			},
		});
	}

	const { pwd, ...user } = results;

	res.json({
		success: true,
		data: {
			token,
			user,
		},
	});
});

module.exports = login;
