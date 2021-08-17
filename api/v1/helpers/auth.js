const fs = require("fs");
const jwt = require("jsonwebtoken");

const { promisePool: db } = require("./db");

module.exports.authToken = async (req, res, next) => {
	try {
		let token = req.body.token;

		if (req.headers.authorization) {
			const [header, headerToken] = req.headers.authorization.split(" ");
			if (header.toLowerCase() === "token") {
				token = headerToken;
			}
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				error: "no_token",
			});
		}

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

		// Check if invalid tokens file exists
		if (!fs.existsSync(process.env.INVALID_TOKENS_LOCATION)) {
			// Make dir
			const dirname = path.dirname(process.env.INVALID_TOKENS_LOCATION);
			if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

			// Make file
			fs.writeFileSync(process.env.INVALID_TOKENS_LOCATION, JSON.stringify({ invalid_tokens: [] }));
		}

		// Check if token is still valid
		const invalidTokens = JSON.parse(fs.readFileSync(process.env.INVALID_TOKENS_LOCATION));
		const invalidToken = invalidTokens.invalid_tokens.find((x) => x.id === decodedToken.id);
		if (invalidToken) {
			// Check if all invalid tokens must be expired
			if (Date.now() - invalidToken.date > 1000 * 60 * 60 * 24 * process.env.JWT_TOKEN_EXPIRATION) {
				// Delete from list
				invalidTokens.invalid_tokens.splice(invalidTokens.invalid_tokens.indexOf(invalidToken), 1);
			}

			// Update json
			fs.writeFileSync(process.env.INVALID_TOKENS_LOCATION, JSON.stringify(invalidTokens));

			if (invalidToken.date > decodedToken.iat * 1000) {
				// Something changed on the user token is not valid
				// Return status 401 (failed authentication)
				return res.status(401).json({
					success: false,
					error: "failed_authentication",
				});
			}
		}

		const [results] = await db.query(`SELECT count(*) FROM users WHERE id = ?`, [decodedToken.id]);

		// User not found
		if (results[0]["count(*)"] < 1) {
			// Return status 401 (failed authentication)
			return res.status(401).json({
				success: false,
				error: "failed_authentication",
			});
		}

		req.token = decodedToken;

		next();
	} catch (error) {
		res.status(401).json({
			success: false,
			error: "failed_authentication",
		});
	}
};

const timeoutPromise = new Promise((resolve) => setTimeout(resolve.bind(undefined, false), 1000 * 10));
module.exports.authToken.promise = (req, res) =>
	Promise.race([
		new Promise((resolve) => {
			authToken(req, res, () => {
				resolve(true);
			});
		}),
		timeoutPromise,
	]);

module.exports.authRights = async (rights, token, businessId = null) => {
	if (!token) {
		return {
			status: 401,
			success: false,
			error: "failed_authentication",
		};
	}

	// Make sure rights is an array of numbers
	if (!Array.isArray(rights)) {
		// If not array and not number no rights required
		if (typeof rights !== "number") rights = [];
		// Make right in to array of rights
		else rights = [rights];
	} else {
		// Filter numbers
		rights = rights.map((x) => (Array.isArray(x) ? x.filter((y) => typeof y === "number") : x)).filter((x) => typeof x === "number" || Array.isArray(x));
	}

	try {
		// Get rights
		const [results] = await db.query(
			`SELECT rights.rights,users.business_id,business.owner_id FROM rights INNER JOIN users ON rights.id = users.right_id INNER JOIN business ON users.business_id = business.id WHERE users.id = ?`,
			[req.token.id]
		);

		// Rights not found
		if (results.length < 1) {
			return {
				status: 401,
				success: false,
				error: "failed_authentication",
			};
		}

		// Trying to modify other business
		if (results[0].business_id !== businessId) {
			return {
				status: 403,
				success: false,
				error: "forbidden",
			};
		}

		// Owner of business
		if (results[0].owner_id === req.token.id) {
			return { success: true, owner: true };
		}

		const userRights = results[0].rights.split(",").map(Number);

		// User does not have all rights
		if (rights.some((x) => (Array.isArray(x) ? x.filter((y) => userRights.includes(y)).length < 1 : !userRights.includes(x)))) {
			return {
				status: 403,
				success: false,
				error: "forbidden",
			};
		}

		return {
			success: true,
			owner: false,
		};
	} catch (error) {
		return {
			status: 401,
			success: false,
			error: "failed_authentication",
		};
	}
};
