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
const lengthInUtf8Bytes = (str) => {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	const m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
};

// Makes string camel cased
const stringToCamel = (s) => {
	return s.replace(/([-_][a-z])/gi, ($1) => {
		return $1.toUpperCase().replace("-", "").replace("_", "");
	});
};

// Check if o is and object
const isObject = (o) => o === Object(o) && !Array.isArray(o) && typeof o !== "function";

// Makes obj keys with nested obj keys camel cased
const toCamel = (obj) => {
	if (isObject(obj)) {
		const n = {};

		const keys = Object.keys(obj);
		for (let i = 0; i < keys.length; i++) {
			n[stringToCamel(keys[i])] = toCamel(obj[keys[i]]);
		}

		return n;
	} else if (Array.isArray(obj)) {
		return obj.map((i) => toCamel(i));
	}

	return obj;
};

module.exports = { objectToResponse, dbGenerateUnique, dbGenerateUniqueId, fileGenerateUnique, fileGenerateUniqueId, lengthInUtf8Bytes, isObject, toCamel };
