export let config = {
	api: "http://192.168.178.25:8003/v1/",
};
export const setApi = (apiString) => (config.api = apiString);
