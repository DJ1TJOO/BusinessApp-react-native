import { getState, goBack, navigate } from "../RootNavigation";
import config from "./config/config";

const handleError = async (error) => {
	// Check if servers are reachable
	if (error === "servers-timeout") return navigate("NoConnection", { servers: true });
	try {
		const res = await fetchWithTimeout(config.api).then((res) => res.json());
		if (res.success) {
			const routeState = getState();
			const currentRoute = routeState.routes[routeState.index];
			if (currentRoute.name === "NoConnection") goBack();
		} else {
			return navigate("NoConnection", { servers: true });
		}
	} catch (error) {
		return navigate("NoConnection", { servers: true });
	}

	// Send error to servers
	await fetchWithTimeout(config.api + "analytics/error", {
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

/**
 * @param {RequestInfo} url
 * @param {RequestInit} options
 * @param {number} timeout
 * @returns
 */
const fetchWithTimeout = async (url, options = null, timeout = 10000) =>
	Promise.race([fetch(url, options), new Promise((_, reject) => setTimeout(() => reject(new Error("servers-timeout")), timeout))]);

export default { handleError, fetchWithTimeout };
