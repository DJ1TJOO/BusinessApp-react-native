const { promisePool: db } = require("./helpers/db");
const { dbGenerateUniqueId, objectToResponse } = require("./helpers/utils");
const { authToken, authRights } = require("./helpers/auth");
const availableRights = require("./availableRights.json");

const rights = require("express").Router();

module.exports.availableRights = availableRights;

rights.get("/available", (req, res) => {
	return res.send({
		success: true,
		data: availableRights,
		camel: false,
	});
});

rights.get("/:id", authToken, async (req, res) => {
	const { id } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM rights WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([availableRights.GET_RIGHTS], req.token, results[0].business_id);
		if (!auth.success) return objectToResponse(res, auth);

		return res.send({
			success: true,
			data: { ...results[0], rights: results[0].rights.split(",").map(Number) },
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

rights.get("/business/:businessId", authToken, async (req, res) => {
	const { businessId } = req.params;
	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Business does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) business not found
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([availableRights.GET_RIGHTS], req.token, businessId);
		if (!auth.success) return objectToResponse(res, auth);

		const [results] = await db.query(`SELECT * FROM rights WHERE business_id = ?`, [businessId]);

		return res.send({
			success: true,
			data: results.map((x) => ({ ...x, rights: x.rights.split(",").map(Number) })),
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

rights.post("/", authToken, async (req, res) => {
	const { name, businessId, rights } = req.body;

	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Business does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) business not found
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([availableRights.ADD_RIGHTS], req.token, businessId);
		if (!auth.success) return objectToResponse(res, auth);

		// Check if name is correct
		// Name is empty
		if (!name) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "name",
				},
			});
		}

		const [right_result] = await db.query(`SELECT count(*) FROM rights WHERE name = ?`, [name]);

		// Right name taken
		if (right_result[0]["count(*)"] > 0) {
			// Return status 409 (conflict) taken
			return res.status(409).send({
				success: false,
				error: "taken",
				data: {
					field: "name",
				},
			});
		}

		// Name too long
		if (name.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "name",
					maxLength: 255,
				},
			});
		}

		//  Name too short
		if (name.length < 3) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "name",
					minLength: 3,
				},
			});
		}

		// Check if rights is correct
		// Rights is empty
		if (!rights) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "rights",
				},
			});
		}

		// Not array
		if (!Array.isArray(rights)) {
			// Return status 422 (unprocessable entity) invalid
			return res.status(422).send({
				success: false,
				error: "invalid",
				data: {
					field: "rights",
				},
			});
		}

		// Has none exising rights
		if (rights.some((x) => !Object.values(availableRights).includes(x))) {
			// Return status 422 (unprocessable entity) incorrect
			return res.status(422).send({
				success: false,
				error: "incorrect",
				data: {
					field: "rights",
				},
			});
		}

		// Generate id
		const id = await dbGenerateUniqueId("rights", "id");

		// Insert right into db
		await db.query(
			`INSERT INTO 
					rights (id, name, business_id, rights)
					VALUES ('${escape(id)}', '${escape(name)}','${escape(businessId)}','${rights.map((x) => escape(x)).join(",")}')`
		);

		const [results] = await db.query(`SELECT * FROM rights WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return res.send({
			success: true,
			data: { ...results[0], rights: results[0].rights.split(",").map(Number) },
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

rights.patch("/:id", authToken, async (req, res) => {
	const { id } = req.params;
	const { name, rights } = req.body;

	try {
		const [get_results] = await db.query(`SELECT name,rights,business_id FROM rights WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([availableRights.CHANGE_RIGHTS], req.token, get_results[0].business_id);
		if (!auth.success) return objectToResponse(res, auth);

		// Check if name is correct
		let hasName = false;
		if (name && get_results[0].name !== name) {
			const [right_result] = await db.query(`SELECT count(*) FROM rights WHERE name = ?`, [name]);

			// Right name taken
			if (right_result[0]["count(*)"] > 0) {
				// Return status 409 (conflict) taken
				return res.status(409).send({
					success: false,
					error: "taken",
					data: {
						field: "name",
					},
				});
			}

			// Name too long
			if (name.length > 255) {
				// Return status 422 (unprocessable entity) too long
				return res.status(422).send({
					success: false,
					error: "too_long",
					data: {
						field: "name",
						maxLength: 255,
					},
				});
			}

			//  Name too short
			if (name.length < 3) {
				// Return status 422 (unprocessable entity) too short
				return res.status(422).send({
					success: false,
					error: "too_short",
					data: {
						field: "name",
						minLength: 3,
					},
				});
			}

			hasName = true;
		}

		// Check if rights is correct
		let hasRights = false;
		let rightsJoined;
		if (rights) {
			// Not array
			if (!Array.isArray(rights)) {
				// Return status 422 (unprocessable entity) invalid
				return res.status(422).send({
					success: false,
					error: "invalid",
					data: {
						field: "rights",
					},
				});
			}

			// Has none exising rights
			if (rights.some((x) => !Object.values(availableRights).includes(x))) {
				// Return status 422 (unprocessable entity) incorrect
				return res.status(422).send({
					success: false,
					error: "incorrect",
					data: {
						field: "rights",
					},
				});
			}

			rightsJoined = rights.map((x) => escape(x)).join(",");
			if (get_results[0].rights !== rightsJoined) {
				hasRights = true;
			}
		}

		const update = [];
		if (hasName) update.push({ name: "name", value: escape(name) });
		if (hasRights) update.push({ name: "rights", value: rightsJoined });

		// Update right
		if (update.length > 0) {
			await db.query(
				`UPDATE 
					rights
					SET ${update.map((x) => `${x.name} = '${x.value}'`).join(",")}
					WHERE id = '${id}'`
			);
		}

		const [results] = await db.query(`SELECT * FROM rights WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return res.send({
			success: true,
			data: { ...results[0], rights: results[0].rights.split(",").map(Number) },
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

rights.delete("/:id", authToken, async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM rights WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([availableRights.DELETE_RIGHTS], req.token, get_results[0].business_id);
		if (!auth.success) return objectToResponse(res, auth);

		const [delete_results] = await db.query(`DELETE FROM rights WHERE id = ?`, [id]);

		if (delete_results.affectedRows < 1) {
			return res.send({
				success: false,
				error: "failed_to_delete",
			});
		}

		return res.send({
			success: true,
			data: { ...get_results[0], rights: get_results[0].rights.split(",").map(Number) },
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

module.exports = rights;
