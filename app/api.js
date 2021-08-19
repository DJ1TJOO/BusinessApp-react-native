import { config } from "./config/config";
import utils from "./utils";

const base = config.api;

/**
 * @param {String} path
 * @param {RequestInit} options
 * @param {number} timeout
 * @returns
 */
const fetchToken = async (path, options = null, timeout = 10000) => {
	try {
		const token = await AsyncStorage.getItem("token");
		if (!options && token) {
			options = {
				headers: {
					authorization: "Token " + token,
				},
			};
		} else if (options && token) {
			if (options.headers) {
				options.headers.authorization = "Token " + token;
			} else {
				options.headers = {
					authorization: "Token " + token,
				};
			}
		}

		return utils.fetchTimeout(base + path, options, timeout);
	} catch (error) {
		utils.handleError(error);
	}
};

export default { fetchToken };
