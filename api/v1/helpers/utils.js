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
 * @param {string} table
 * @param {string} column
 * @param {function} generator
 * @returns {any}
 */
const dbGenerateUnique = async (table, column, generator) => {
	let value, results;
	do {
		value = generator();
		[results] = await db.query(`SELECT count(*) FROM ${table} WHERE ${column} = '${escape(value)}'`);
	} while (results[0]["count(*)"] > 0);

	return value;
};

/**
 * @param {string} table
 * @param {string} column
 * @returns {Promise<string>
 */
const dbGenerateUniqueId = async (table, column) => await dbGenerateUnique(table, column, uuid);

/**
 * @param {string} folder
 * @param {string} ext
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
 * @param {string} folder
 * @param {string} ext
 * @returns {string}
 */
const fileGenerateUniqueId = (folder, ext) => fileGenerateUnique(folder, ext, uuid);

module.exports = { objectToResponse, dbGenerateUnique, dbGenerateUniqueId, fileGenerateUnique, fileGenerateUniqueId };
