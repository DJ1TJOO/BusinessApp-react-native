const jwt = require("jsonwebtoken");

const { promisePool: db } = require("./db");

const authToken = (req, res, next) => {
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
