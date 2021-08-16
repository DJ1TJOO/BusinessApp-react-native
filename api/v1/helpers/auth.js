const fs = require("fs");
const jwt = require("jsonwebtoken");

const { promisePool: db } = require("./db");

const authToken = async (req, res, next) => {
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

module.exports = authToken;

module.exports.authRights = (rights) => {
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

	return (req, res, next) => {
		// No rights required
		if (rights.length < 1) return next();

		// Handle rights
		const authRights = async () => {
			// Get rights
			const [results] = await db.query(`SELECT rights.rights FROM rights INNER JOIN users ON rights.id = users.right_id WHERE users.id = ?`, [req.token.id]);

			// Rights not found
			if (results.length < 1) {
				return res.status(401).json({
					success: false,
					error: "failed_authentication",
				});
			}

			const userRights = results[0].rights.split(",").map(Number);

			// User does not have all rights
			if (rights.some((x) => (Array.isArray(x) ? x.filter((y) => userRights.includes(y)).length < 1 : !userRights.includes(x)))) {
				return res.status(403).json({
					success: false,
					error: "forbidden",
				});
			}

			next();
		};

		// Make sure there is a token
		if (!req.token) authToken(req, res, authRights);
		else authRights();
	};
};

module.exports.authBusinessOwner = (req, res, next) => {
	authToken(req, res, async () => {
		if (req.body.ownerCode) return next();

		// Check if business exists
		const [getResults] = await db.query(`SELECT owner_id FROM business WHERE id = ?`, [req.params.id]);
		if (getResults.length < 1) {
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		if (getResults[0].owner_id !== req.token.id) {
			return res.status(403).json({
				success: false,
				error: "forbidden",
			});
		}

		next();
	});
};
