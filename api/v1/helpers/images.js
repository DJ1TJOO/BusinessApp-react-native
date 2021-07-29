const fs = require("fs");
const path = require("path");
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
				resolve();
			}
		})
	);
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

module.exports = { router: images, dataURLtoImgFile };
