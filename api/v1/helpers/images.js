const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");
const { fileGenerateUniqueId } = require("./utils");

const images = require("express").Router();

/**
 * @type {Array<{
 * 	location: String,
 * 	buffer: Buffer,
 * 	needsUpdate: Boolean
 * }>}
 */
const cachedImages = [];

/**
 * @param {string} dataurl
 * @param {string} filename
 * @param {boolean} force
 */
const dataURLtoImgFile = (dataurl, filename, force = false) => {
	dataurl = dataurl.replace(/^data:image\/png;base64,/, "");

	const location = path.join(process.env.IMAGE_LOCATION, filename + ".png");

	const exists = fs.existsSync(location);
	if (!force && exists) {
		return new Promise((resolve, reject) => reject(true));
	}

	return new Promise((resolve, reject) =>
		fs.writeFile(location, dataurl, "base64", (err) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(location);

				if (exists) {
					const cached = cachedImages.find((x) => x.location === location);
					if (cached) cached.needsUpdate = true;
				}
			}
		})
	);
};

/**
 * @param {string} folder
 * @param {string} image
 * @returns {{id: string,
 *            location: string,
 *            size: {
 *              width: number,
 *              height: number,
 *            },
 *            file: fs.Stats
 *          }?}
 */
const saveImage = async (folder, image) => {
	const id = fileGenerateUniqueId(path.join(process.env.IMAGE_LOCATION, folder), "png");
	const location = await dataURLtoImgFile(image, path.join(folder, id));
	const size = sizeOf(location);

	const file = fs.statSync(location);

	// Convert the file size to megabytes
	file.sizeMb = file.size / (1024 * 1024);

	try {
		return { id, location, size, file };
	} catch (error) {
		return null;
	}
};

/**
 *
 * @param {string} folder
 * @param {string} id
 * @returns {boolean}
 */
const deleteImage = (folder, id) => {
	const location = path.join(process.env.IMAGE_LOCATION, folder, id + ".png");
	try {
		fs.unlinkSync(location);
		return true;
	} catch (error) {
		return false;
	}
};

images.get("/*", (req, res) => {
	const location = path.join(process.env.IMAGE_LOCATION, req.params["0"] + ".png");

	const cached = cachedImages.findIndex((x) => x.location === location);
	if (cached > -1) {
		if (cachedImages[cached].needsUpdate) {
			cachedImages.splice(cached, 1);
		} else {
			return res.type("image/png").send(cachedImages[cached].buffer);
		}
	}

	if (!fs.existsSync(location)) {
		return res.status(404).send({
			success: false,
			error: "image_not_found",
		});
	}

	try {
		const image = fs.readFileSync(location, "base64");
		const buffer = Buffer.from(image, "base64");

		cachedImages.push({
			location,
			buffer,
			needsUpdate: false,
		});

		return res.type("image/png").send(buffer);
	} catch (error) {
		return res.status(500).send({
			success: false,
			error: "internal",
		});
	}
});

module.exports = { router: images, dataURLtoImgFile, saveImage, deleteImage };
