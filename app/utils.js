import config from "./config/config";

const handleError = async (error) => {
	await fetch(config.api + "analytics/error", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ error }),
	});

	// TODO: make nice error screen
	throw error;
};

export default { handleError };
