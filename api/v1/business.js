const fs = require("fs");
const path = require("path");

const { promisePool: db } = require("./helpers/db");
const sendEmail = require("./helpers/mailer");
const { dbGenerateUniqueId, fileGenerateUniqueId } = require("./helpers/utils");
const { dataURLtoImgFile } = require("./helpers/images");

const business = require("express").Router();

// TODO: authorization
business.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM business WHERE id = '${id}'`);
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

		if (!image.includes("data:image/png;base64,")) {
		}

		// Generate image id
		const imageId = fileGenerateUniqueId(process.env.IMAGE_LOCATION, "png");
		dataURLtoImgFile();

		// Generate id
		const id = await dbGenerateUniqueId("business", "id");
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
