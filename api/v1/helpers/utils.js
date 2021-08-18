const { promisePool: db, escape } = require("./db");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

/**
 *
 * @param {import("express").Response} res
 * @param {Object} obj
 */
const objectToResponse = (res, obj) => {
	if (obj.status) {
		const { status, ...send } = obj;
		return res.status(status).send(send);
	} else {
		return res.send(obj);
	}
};

/**
 * @param {String} table
 * @param {String} column
 * @param {function} generator
 * @returns {any}
 */
const dbGenerateUnique = async (table, column, generator) => {
	let value, results;
	do {
		value = generator();
		[results] = await db.query(`SELECT count(*) FROM ${table} WHERE ${column} = ${escape(value)}`);
	} while (results[0]["count(*)"] > 0);

	return value;
};

/**
 * @param {String} table
 * @param {String} column
 * @returns {Promise<String>
 */
const dbGenerateUniqueId = async (table, column) => await dbGenerateUnique(table, column, uuid);

/**
 * @param {String} folder
 * @param {String} ext
 * @param {function} generator
 * @returns {any}
 */
const fileGenerateUnique = (folder, ext, generator) => {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder, { recursive: true });
		return generator();
	}

	let id;
	do {
		id = generator();
	} while (fs.existsSync(path.join(folder, id + "." + ext)));

	return id;
};

/**
 * @param {String} folder
 * @param {String} ext
 * @returns {String}
 */
const fileGenerateUniqueId = (folder, ext) => fileGenerateUnique(folder, ext, uuid);

/**
 * Calculates string byte length
 * @param {String} str
 * @returns {Number}
 */
function lengthInUtf8Bytes(str) {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
}

module.exports = { objectToResponse, dbGenerateUnique, dbGenerateUniqueId, fileGenerateUnique, fileGenerateUniqueId, lengthInUtf8Bytes };
