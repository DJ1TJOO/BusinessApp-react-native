const { promisePool: db } = require("./helpers/db");
const { dbGenerateUniqueId } = require("./helpers/utils");

const rights = require("express").Router();

// TOOD: add rights
const existingRights = ["right1", "right2"];

// TODO: authorization
// TODO: test
rights.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM rights WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
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

rights.get("/business/:businessId", async (req, res) => {
	const { businessId } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM rights WHERE business_id = ?`, [businessId]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
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

rights.post("/", async (req, res) => {
	const { name, businessId, rights } = req.body;

	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Chat does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) chat not found
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

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
		if (rights.some((x) => !existingRights.includes(x))) {
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
					VALUES ('${escape(id)}', '${escape(name)}','${escape(businessId)}','${escape(rights.join(","))}')`
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

rights.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const { name, rights } = req.body;

	try {
		const [get_results] = await db.query(`SELECT count(*) FROM rights WHERE id = ?`, [id]);
		if (get_results[0]["count(*)"] < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
			});
		}

		// Check if name is correct
		let hasName = false;
		if (name) {
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
			if (rights.some((x) => !existingRights.includes(x))) {
				// Return status 422 (unprocessable entity) incorrect
				return res.status(422).send({
					success: false,
					error: "incorrect",
					data: {
						field: "rights",
					},
				});
			}

			hasRights = true;
		}

		const update = [];
		if (hasName) update.push({ name: "name", value: escape(name) });
		if (hasRights) update.push({ name: "rights", value: escape(rights.join(",")) });

		// Update right
		await db.query(
			`UPDATE 
					rights
					SET ${update.map((x) => `${x.name} = '${x.value}'`).join(",")}
					WHERE id = '${id}'`
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

rights.delete("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM rights WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "right_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM rights WHERE id = ?`, [id]);

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
