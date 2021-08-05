/**
 *
 * @param {Object} language
 * @param {Object} res
 * @param {{[key]: String | Object}} body
 * @param {String} type
 * @param {{[key]: String}} fields
 * @returns {String}
 */
const convertError = (language, res, body, type, fields) => {
	let errorMessage = language.errors[res.error];
	if (!errorMessage) return res.error;

	if (type) {
		errorMessage = errorMessage.replace("<type>", type);
	} else {
		errorMessage = errorMessage.replace("<type>", "");
	}

	if (res.data) {
		errorMessage = errorMessage.replace("<field>", fields[res.data.field] || res.data.field);
		errorMessage = errorMessage.replace("<value>", `'${body[res.data.field]}'`);
		errorMessage = errorMessage.replace("<min>", res.data.min);
		errorMessage = errorMessage.replace("<max>", res.data.max);
		errorMessage = errorMessage.replace("<minLength>", res.data.minLength);
		errorMessage = errorMessage.replace("<maxLength>", res.data.maxLength);
		errorMessage = errorMessage.replace("<minSize>", res.data.minSize);
		errorMessage = errorMessage.replace("<maxSize>", res.data.maxSize);
	} else {
		errorMessage = errorMessage.replace("<field>", "");
		errorMessage = errorMessage.replace("<value>", "");
		errorMessage = errorMessage.replace("<min>", "");
		errorMessage = errorMessage.replace("<max>", "");
		errorMessage = errorMessage.replace("<minLength>", "");
		errorMessage = errorMessage.replace("<maxLength>", "");
		errorMessage = errorMessage.replace("<minSize>", "");
		errorMessage = errorMessage.replace("<maxSize>", "");
	}

	// Remove double spaces
	errorMessage = errorMessage.replace(/  +/g, " ");

	return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
};

export default { convertError };
