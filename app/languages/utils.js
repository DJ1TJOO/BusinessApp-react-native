const convertError = (language, res, body, type, fields) => {
	let errorMessage = language.errors[res.error];
	errorMessage = errorMessage.replace("<type>", type);
	if (res.data) {
		errorMessage = errorMessage.replace("<field>", fields[res.data.field] || res.data.field);
		errorMessage = errorMessage.replace("<value>", body[res.data.field]);
		errorMessage = errorMessage.replace("<min>", res.data.min);
		errorMessage = errorMessage.replace("<max>", res.data.max);
		errorMessage = errorMessage.replace("<minLength>", res.data.minLength);
		errorMessage = errorMessage.replace("<maxLength>", res.data.maxLength);
		errorMessage = errorMessage.replace("<minSize>", res.data.minSize);
		errorMessage = errorMessage.replace("<maxSize>", res.data.maxSize);
	}

	return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
};

export default { convertError };
