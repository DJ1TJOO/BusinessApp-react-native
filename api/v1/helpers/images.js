const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");

const images = require("express").Router();

/**
 * @param {string} dataurl
 * @param {string} filename
 * @param {boolean} force
 */
const dataURLtoImgFile = (dataurl, filename, force = false) => {
	dataurl = dataurl.replace(/^data:image\/png;base64,/, "");

	const location = path.join(process.env.IMAGE_LOCATION, filename + ".png");

	if (!force && fs.existsSync(location)) {
		return new Promise((resolve, reject) => reject(true));
	}

	return new Promise((resolve, reject) =>
		fs.writeFile(location, dataurl, "base64", (err) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(location);
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
	if (!fs.existsSync(location)) {
		return res.status(404).send({
			success: false,
			error: "image_not_found",
		});
	}
	res.sendFile(path.resolve(location));
});

module.exports = { router: images, dataURLtoImgFile, saveImage, deleteImage };
