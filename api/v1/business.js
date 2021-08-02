const { promisePool: db, escape } = require("./helpers/db");
const { dbGenerateUniqueId } = require("./helpers/utils");
const { saveImage, deleteImage } = require("./helpers/images");

const business = require("express").Router();

// TODO: authorization
// TODO: test all
business.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM business WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "business_not_found",
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

/**
 * @type {Array<{
 * 	businessId: string,
 * 	expirationDate: Date,
 * 	code: number
 * }>}
 */
const ownerCodes = [];

const generateCode = (length) => {
	return Math.random()
		.toString()
		.slice(2, 2 + length);
};

business.post("/", async (req, res) => {
	const { name, image } = req.body;
	try {
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

		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE name = ?`, [name]);

		// Busines name taken
		if (business_result[0]["count(*)"] > 0) {
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

		// Name too short
		if (name.length < 5) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "name",
					minLength: 5,
				},
			});
		}

		// Check if image is correct
		// Image is empty
		if (!image) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "image",
				},
			});
		}

		if (!image.startsWith("data:image/png;base64,")) {
			// Return status 422 (unprocessable entity) invalid
			return res.status(422).send({
				success: false,
				error: "invalid",
				data: {
					field: "image",
				},
			});
		}

		// Generate image id
		const imageInfo = await saveImage("business_logos", image);
		if (!imageInfo) {
			// Return status 500 (internal server error) failed_image_save
			return res.status(500).send({
				success: false,
				error: "failed_image_save",
			});
		}

		// Validate Image
		// Check size
		if (imageInfo.size.width !== imageInfo.size.height) {
			deleteImage("business_logos", imageInfo.id);
			return res.status(422).send({
				success: false,
				error: "image_not_rect",
				data: {
					field: "image",
				},
			});
		}

		if (imageInfo.size.width > 300 || imageInfo.size.height > 300) {
			deleteImage("business_logos", imageInfo.id);
			return res.status(422).send({
				success: false,
				error: "image_too_big",
				data: {
					field: "image",
					maxSize: 300,
				},
			});
		}

		if (imageInfo.size.width < 50 || imageInfo.size.height < 50) {
			deleteImage("business_logos", imageInfo.id);
			return res.status(422).send({
				success: false,
				error: "image_too_small",
				data: {
					field: "image",
					minSize: 50,
				},
			});
		}

		// Check file size
		if (imageInfo.file.sizeMb > 1) {
			deleteImage("business_logos", imageInfo.id);
			return res.status(422).send({
				success: false,
				error: "file_too_big",
				data: {
					field: "image",
					maxSize: 1,
				},
			});
		}

		// Generate id
		const id = await dbGenerateUniqueId("business", "id");

		// Find code
		let code;
		do {
			code = generateCode(6);
		} while (ownerCodes.find((x) => x.code === code));

		// Date plus one hour
		const expirationDate = Date.now() + 60 * 60 * 1000;

		// Remove code after one hour
		setTimeout(() => {
			const index = ownerCodes.findIndex((x) => x.code === code);
			if (index >= 0) {
				ownerCodes.splice(index, 1);
			}
		}, 60 * 60 * 1000);

		// Add code to list
		ownerCodes.push({
			businessId: id,
			expirationDate,
			code,
		});

		// Insert business into db
		await db.query(
			`INSERT INTO 
					 business (id, name, logo)
					VALUES (?,?,?)`,
			[id, name, imageInfo.id]
		);

		const [results] = await db.query(`SELECT * FROM business WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return res.send({
			success: true,
			data: {
				ownerCode: code,
				business: results[0],
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

business.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const { name, image, owner, ownerCode } = req.body;
	try {
		// Check if business exists
		const [getResults] = await db.query(`SELECT * FROM business WHERE id = ?`, [id]);
		if (getResults.length < 1) {
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if owner is specified
		let hasOwnerId = false;
		if (ownerCode) {
			// Check if code exists
			const index = ownerCodes.findIndex((x) => x.code === ownerCode);
			if (index < 0) {
				return res.status(404).send({
					success: false,
					error: "code_not_found",
				});
			}

			// Remove recover codes
			const set = ownerCodes.splice(index, 1)[0];

			// Check id
			if (set.businessId !== id) {
				return res.status(404).send({
					success: false,
					error: "code_not_found",
				});
			}

			// Check expired
			if (set.expirationDate < Date.now()) {
				// Expired code
				return res.status(498).send({
					success: false,
					error: "expired",
					data: {
						field: "ownerCode",
					},
				});
			}

			if (!owner) {
				// Return status 422 (unprocessable entity) empty
				return res.status(422).send({
					success: false,
					error: "empty",
					data: {
						field: "owner",
					},
				});
			}

			// Check if user exists
			const [getUserResults] = await db.query(`SELECT * FROM users WHERE id = ?`, [owner]);
			if (getUserResults.length < 1) {
				return res.status(404).send({
					success: false,
					error: "user_not_found",
				});
			}

			hasOwnerId = true;
		}

		// Check if name is specified
		let hasName = false;
		if (name) {
			const [business_result] = await db.query(`SELECT count(*) FROM business WHERE name = ?`, [name]);

			// Busines name taken
			if (business_result[0]["count(*)"] > 0) {
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

			// Name too short
			if (name.length < 5) {
				// Return status 422 (unprocessable entity) too short
				return res.status(422).send({
					success: false,
					error: "too_short",
					data: {
						field: "name",
						minLength: 5,
					},
				});
			}

			hasName = true;
		}

		// Check if image is specified
		let hasImage = false;
		let imageInfo = null;
		if (image) {
			if (!image.startsWith("data:image/png;base64,")) {
				// Return status 422 (unprocessable entity) invalid
				return res.status(422).send({
					success: false,
					error: "invalid",
					data: {
						field: "image",
					},
				});
			}

			// Generate image id
			imageInfo = await saveImage("business_logos", image);
			if (!imageInfo) {
				// Return status 500 (internal server error) failed_image_save
				return res.status(500).send({
					success: false,
					error: "failed_image_save",
				});
			}

			// Validate Image
			// Check size
			if (imageInfo.size.width !== imageInfo.size.height) {
				deleteImage("business_logos", imageInfo.id);
				return res.status(422).send({
					success: false,
					error: "image_not_rect",
					data: {
						field: "image",
					},
				});
			}

			if (imageInfo.size.width > 300 || imageInfo.size.height > 300) {
				deleteImage("business_logos", imageInfo.id);
				return res.status(422).send({
					success: false,
					error: "image_too_big",
					data: {
						field: "image",
						maxSize: 300,
					},
				});
			}

			if (imageInfo.size.width < 50 || imageInfo.size.height < 50) {
				deleteImage("business_logos", imageInfo.id);
				return res.status(422).send({
					success: false,
					error: "image_too_small",
					data: {
						field: "image",
						minSize: 50,
					},
				});
			}

			// Check file size
			if (imageInfo.file.sizeMb > 1) {
				deleteImage("business_logos", imageInfo.id);
				return res.status(422).send({
					success: false,
					error: "file_too_big",
					data: {
						field: "image",
						maxSize: 1,
					},
				});
			}

			hasImage = true;
		}

		const update = [];
		if (hasOwnerId) update.push({ name: "owner_id", value: owner });
		if (hasName) update.push({ name: "name", value: name });
		if (hasImage) update.push({ name: "logo", value: imageInfo.id });

		// Update business
		await db.query(
			`UPDATE 
					business
					SET ${update.map((x) => `${x.name} = ${escape(x.value)}`).join(",")}
					WHERE id = ?`,
			[id]
		);

		if (hasImage) deleteImage("business_logos", getResults[0].logo);

		const [results] = await db.query(`SELECT * FROM business WHERE id = ?`, [id]);
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

business.delete("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM business WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM business WHERE id = ?`, [id]);

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

module.exports = business;
