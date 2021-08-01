const { promisePool: db } = require("./helpers/db");
const { dbGenerateUniqueId, objectToResponse } = require("./helpers/utils");

const hours = require("express").Router();

/**
 * @param {{
 *  [key]: String,
 * }} params
 */
const getHours = async (params) => {
	try {
		const [results] = await db.query(
			`SELECT * FROM hours WHERE ${params
				.keys()
				.map((x) => `${x} = '${params[x]}'`)
				.join(" AND ")}`
		);
		if (results.length < 1) {
			return {
				status: 404,
				success: false,
				error: "hours_not_found",
			};
		}

		if (results.length === 1) {
			return await addProjectHours(results[0]);
		}

		const data = [];
		for (let i = 0; i < results.length; i++) {
			const { success, ...hours } = await addProjectHours(results[i]);

			if (!success) return { success, ...hours };

			data.push(hours.data);
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return {
			status: 500,
			success: false,
			error: "mysql",
		};
	}
};

/**
 * @param {{
 *  id: String,
 *  user_id: String,
 *  business_id: String,
 *  year: number,
 *  week: number
 * }} hours
 */
const addProjectHours = async (hours) => {
	try {
		const [hoursResults] = await db.query(`SELECT * FROM project_hours WHERE hours_id = '${hours.id}'`);

		return {
			success: true,
			data: {
				...hours,
				hours: hoursResults.map((x) => {
					const { hours_id, ...hours } = x;
					return hours;
				}),
			},
		};
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return {
			status: 500,
			success: false,
			error: "mysql",
		};
	}
};

// TODO: authorization
// TODO: test all
hours.get("/:id", async (req, res) => {
	const { id } = req.params;
	return objectToResponse(res, await getHours({ id }));
});

// Get hours from user overall, year, week
hours.get("/users/:userId/:year?/:week?", async (req, res) => {
	const { userId, year, week } = req.params;

	const params = { user_id: userId };
	if (week) params.week = week;
	if (year) params.year = year;

	// Week fist is faster
	return objectToResponse(res, await getHours(params));
});

// Get hours from business overall, year, week
hours.get("/business/:businessId/:year?/:week?", async (req, res) => {
	const { businessId, year, week } = req.params;

	const params = { business_id: businessId };
	if (week) params.week = week;
	if (year) params.year = year;

	// Week fist is faster
	return objectToResponse(res, await getHours(params));
});

// TODO: post, patch, delete

module.exports = hours;
