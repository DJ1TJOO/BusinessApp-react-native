import { getState, goBack, navigate } from "../RootNavigation";
import { config } from "./config/config";

const handleError = async (error) => {
	// Check if servers are reachable
	if (error === "servers-timeout") {
		return navigate("NoConnection", { servers: true });
	}

	try {
		const res = await fetchTimeout(config.api).then((res) => res.json());
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
	await fetchTimeout(config.api + "analytics/error", {
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
const fetchTimeout = async (url, options = null, timeout = 10000) => {
	let timeoutPid;
	const timeoutPromise = new Promise((_, reject) => (timeoutPid = setTimeout(() => reject(new Error("servers-timeout")), timeout)));

	return Promise.race([fetch(url, options), timeoutPromise]).then((res) => {
		clearTimeout(timeoutPid);
		return res;
	});
};

const uuidv4 = () =>
	"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});

export default { handleError, fetchTimeout, uuidv4 };
