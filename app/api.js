import AsyncStorage from "@react-native-async-storage/async-storage";

import { config } from "./config/config";
import utils from "./utils";

const base = config.api;

/**
 * @param {String} path
 * @param {RequestInit} options
 * @param {number} timeout
 * @returns
 */
const fetchToken = async (path = "", options = null, timeout = 10000) => {
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

		if (options && options.json) {
			if (options.headers) {
				options.headers["Accept"] = "application/json";
				options.headers["Content-Type"] = "application/json";
			} else {
				options.headers = {
					Accept: "application/json",
					"Content-Type": "application/json",
				};
			}

			if (options.body) options.body = JSON.stringify(options.body);

			delete options.json;
		}

		return utils.fetchTimeout(base + path, options, timeout);
	} catch (error) {
		utils.handleError(error);
		return {
			success: false,
		};
	}
};

export default { fetchToken };
