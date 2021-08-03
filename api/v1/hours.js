const { promisePool: db, escape } = require("./helpers/db");
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
			`SELECT * FROM hours WHERE ${Object.keys(params)
				.map((x) => `${x} = ${escape(params[x])}`)
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
		const [hoursResults] = await db.query(`SELECT * FROM project_hours WHERE hours_id = ?`, [hours.id]);

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

const createHours = async (body) => {
	const { userId, businessId, week, year } = body;
	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Busines does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) business not found
			return { status: 404, success: false, error: "business_not_found" };
		}

		const [user_result] = await db.query(`SELECT count(*) FROM users WHERE id = ?`, [userId]);

		// User does not exists
		if (user_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) user not found
			return { status: 404, success: false, error: "user_not_found" };
		}

		// Check year
		// Year is empty
		if (!year) {
			// Return status 422 (unprocessable entity) empty
			return {
				status: 422,
				success: false,
				error: "empty",
				data: {
					field: "year",
				},
			};
		}

		// Invalid year
		if (!isNaN(year)) {
			// Return status 422 (unprocessable entity) incorrect
			return {
				status: 422,
				success: false,
				error: "incorrect",
				data: {
					field: "year",
				},
			};
		}

		// Invalid year
		if (!Number.isInteger(year)) {
			// Return status 422 (unprocessable entity) incorrect
			return {
				status: 422,
				success: false,
				error: "incorrect",
				data: {
					field: "year",
				},
			};
		}

		// Check week
		// Week is empty
		if (!week) {
			// Return status 422 (unprocessable entity) empty
			return {
				status: 422,
				success: false,
				error: "empty",
				data: {
					field: "week",
				},
			};
		}

		// Invalid week
		if (!isNaN(week)) {
			// Return status 422 (unprocessable entity) incorrect
			return {
				status: 422,
				success: false,
				error: "incorrect",
				data: {
					field: "week",
				},
			};
		}

		// Invalid week
		if (!Number.isInteger(week)) {
			// Return status 422 (unprocessable entity) incorrect
			return {
				status: 422,
				success: false,
				error: "incorrect",
				data: {
					field: "week",
				},
			};
		}

		// Week too low
		if (week < 1) {
			// Return status 422 (unprocessable entity) too low
			return {
				status: 422,
				success: false,
				error: "too_low",
				data: {
					field: "week",
					min: 1,
				},
			};
		}

		// Week too high
		if (week > 53) {
			// Return status 422 (unprocessable entity) too high
			return {
				status: 422,
				success: false,
				error: "too_high",
				data: {
					field: "week",
					max: 53,
				},
			};
		}

		// Generate id
		const id = await dbGenerateUniqueId("hours", "id");

		// Insert hours into db
		await db.query(
			`INSERT INTO 
					hours (id, user_id, business_id, year, week)
					VALUES (?,?,?,?,?)`,
			[id, userId, businessId, year, week]
		);

		const [results] = await db.query(`SELECT * FROM hours WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return { status: 500, success: false, error: "internal" };
		}
		return res.send({
			success: true,
			data: results[0],
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return { status: 500, success: false, error: "mysql" };
	}
};

hours.post("/", async (req, res) => {
	return objectToResponse(res, await createHours(req.body));
});

const validateNumber = (field, value, min, max, checkEmpty = true) => {
	// Check value
	// Value is empty
	if (!value && checkEmpty) {
		// Return status 422 (unprocessable entity) empty
		return {
			status: 422,
			success: false,
			error: "empty",
			data: {
				field,
			},
		};
	} else if (!value && !checkEmpty) {
		return {
			success: true,
			data: null,
		};
	}

	// Invalid value
	if (!isNaN(value)) {
		// Return status 422 (unprocessable entity) incorrect
		return {
			status: 422,
			success: false,
			error: "incorrect",
			data: {
				field,
			},
		};
	}

	// Value too low
	if (value < min) {
		// Return status 422 (unprocessable entity) too low
		return {
			status: 422,
			success: false,
			error: "too_low",
			data: {
				field,
				min,
			},
		};
	}

	// Value too high
	if (value > max) {
		// Return status 422 (unprocessable entity) too high
		return {
			status: 422,
			success: false,
			error: "too_high",
			data: {
				field,
				max,
			},
		};
	}

	return {
		success: true,
		data: value,
	};
};

/**
 * @param {{
 *  [key]: String,
 * }} params
 */
const createProjectHours = async (hoursId, body) => {
	const { project, projectId, description, monday, tueseday, wednesday, thursday, friday, saturday, sunday } = body;
	try {
		// Check monday
		const mondayValidation = validateNumber("monday", monday, 0, 24);
		if (!mondayValidation.success) return objectToResponse(res, mondayValidation);

		// Check tueseday
		const tuesedayValidation = validateNumber("tueseday", tueseday, 0, 24);
		if (!tuesedayValidation.success) return objectToResponse(res, tuesedayValidation);

		// Check wednesday
		const wednesdayValidation = validateNumber("wednesday", wednesday, 0, 24);
		if (!wednesdayValidation.success) return objectToResponse(res, wednesdayValidation);

		// Check thursday
		const thursdayValidation = validateNumber("thursday", thursday, 0, 24);
		if (!thursdayValidation.success) return objectToResponse(res, thursdayValidation);

		// Check friday
		const fridayValidation = validateNumber("friday", friday, 0, 24);
		if (!fridayValidation.success) return objectToResponse(res, fridayValidation);

		// Check saturday
		const saturdayValidation = validateNumber("saturday", saturday, 0, 24);
		if (!saturdayValidation.success) return objectToResponse(res, saturdayValidation);

		// Check sunday
		const sundayValidation = validateNumber("sunday", sunday, 0, 24);
		if (!sundayValidation.success) return objectToResponse(res, sundayValidation);

		// Check if project is correct
		// Project is empty
		if (!project) {
			// Return status 422 (unprocessable entity) empty
			return {
				status: 422,
				success: false,
				error: "empty",
				data: {
					field: "project",
				},
			};
		}

		// Project too long
		if (project.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return {
				status: 422,
				success: false,
				error: "too_long",
				data: {
					field: "project",
					maxLength: 255,
				},
			};
		}

		// Project too short
		if (project.length < 3) {
			// Return status 422 (unprocessable entity) too short
			return {
				status: 422,
				success: false,
				error: "too_short",
				data: {
					field: "project",
					minLength: 3,
				},
			};
		}

		let hasDescription = false;
		if (description) {
			// Description too long
			if (lastName.length > 255) {
				// Return status 422 (unprocessable entity) too long
				return {
					status: 422,
					success: false,
					error: "too_long",
					data: {
						field: "description",
						maxLength: 255,
					},
				};
			}
			hasDescription = true;
		}

		let hasProjectId = false;
		if (projectId) {
			const [project_result] = await db.query(`SELECT count(*) FROM projects WHERE id = ?`, [projectId]);

			// Project does not exists
			if (project_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) project not found
				return { status: 404, success: false, error: "project_not_found" };
			}
			hasProjectId = true;
		}

		// Generate id
		const id = await dbGenerateUniqueId("project_hours", "id");

		// Insert hours into db
		await db.query(
			`INSERT INTO 
					project_hours (id, hours_id, project, ${hasProjectId ? "project_id," : ""} ${hasDescription ? "description," : ""} monday, tueseday, wednesday, thursday, friday, saturday, sunday)
					VALUES (${escape(id)}, ${escape(hoursId)},${escape(project)}, ${hasProjectId ? `${escape(projectId)},` : ""} ${hasDescription ? `${escape(description)},` : ""} '${escape(
				monday
			)}', ${escape(tueseday)}, ${escape(wednesday)}, ${escape(thursday)}, ${escape(friday)}, ${escape(saturday)}, ${escape(sunday)})`
		);

		const [results] = await db.query(`SELECT * FROM project_hours WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return { status: 500, success: false, error: "internal" };
		}

		return {
			success: true,
			data: results[0],
		};
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return { status: 500, success: false, error: "mysql" };
	}
};

hours.post("/:hoursId", async (req, res) => {
	const { hoursId } = req.params;

	try {
		const [hours_result] = await db.query(`SELECT count(*) FROM hours WHERE id = ?`, [hoursId]);

		// Hours does not exists
		if (hours_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) hours not found
			return res.status(404).send({ success: false, error: "hours_not_found" });
		}

		return objectToResponse(res, await createProjectHours(hoursId, req.body));
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({ success: false, error: "mysql" });
	}
});

hours.post("/:userId/:year/:week", async (req, res) => {
	const { userId, week, year } = req.params;

	try {
		// Get id
		let id = null;
		const [hours_result] = await db.query(`SELECT id FROM hours WHERE user_id = ? AND week = ? AND year = ?`, [userId, week, year]);

		// Hours does not exists
		if (hours_result.length < 1) {
			const hours = await createHours(req.body);

			if (!hours.success) {
				// Return error creating hours
				return objectToResponse(res, hours);
			}

			id = hours.data.id;
		} else {
			id = hours_result[0].id;
		}

		return objectToResponse(res, await createProjectHours(id, req.body));
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({ success: false, error: "mysql" });
	}
});

hours.patch("/:id", async (res, res) => {
	const { id } = req.params;
	const { valid } = req.body;
	try {
		// Check if hours exists
		const [getResults] = await db.query(`SELECT count(*) FROM hours WHERE id = ?`, [id]);
		if (getResults[0]["count(*)"] < 1) {
			return res.status(404).send({
				success: false,
				error: "hours_not_found",
			});
		}

		// Not specified
		if (typeof valid === "undefined") {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "valid",
				},
			});
		}

		// Not boolean
		if (typeof valid !== "boolean") {
			// Return status 422 (unprocessable entity) incorrect
			return res.status(422).send({
				success: false,
				error: "invalid",
				data: {
					field: "valid",
				},
			});
		}

		// Update business
		await db.query(
			`UPDATE 
					hours
					SET valid = ?
					WHERE id = ?`,
			[valid, id]
		);

		const [results] = await db.query(`SELECT * FROM hours WHERE id = ?`, [id]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return res.send({
			success: true,
			data: results[0],
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});

hours.patch("/project/:projectHoursId", async (req, res) => {
	const { projectHoursId } = req.params;
	const { project, projectId, description, monday, tueseday, wednesday, thursday, friday, saturday, sunday } = req.body;
	try {
		const [get_results] = await db.query(`SELECT count(*) FROM project_hours WHERE id = ?`, [projectHoursId]);
		if (get_results[0]["count(*)"] < 1) {
			return res.status(404).send({
				success: false,
				error: "project_hours_not_found",
			});
		}

		// Check monday
		const mondayValidation = validateNumber("monday", monday, 0, 24, false);
		if (!mondayValidation.success) return objectToResponse(res, mondayValidation);

		// Check tueseday
		const tuesedayValidation = validateNumber("tueseday", tueseday, 0, 24, false);
		if (!tuesedayValidation.success) return objectToResponse(res, tuesedayValidation);

		// Check wednesday
		const wednesdayValidation = validateNumber("wednesday", wednesday, 0, 24, false);
		if (!wednesdayValidation.success) return objectToResponse(res, wednesdayValidation);

		// Check thursday
		const thursdayValidation = validateNumber("thursday", thursday, 0, 24, false);
		if (!thursdayValidation.success) return objectToResponse(res, thursdayValidation);

		// Check friday
		const fridayValidation = validateNumber("friday", friday, 0, 24, false);
		if (!fridayValidation.success) return objectToResponse(res, fridayValidation);

		// Check saturday
		const saturdayValidation = validateNumber("saturday", saturday, 0, 24, false);
		if (!saturdayValidation.success) return objectToResponse(res, saturdayValidation);

		// Check sunday
		const sundayValidation = validateNumber("sunday", sunday, 0, 24, false);
		if (!sundayValidation.success) return objectToResponse(res, sundayValidation);

		// Check if project is correct
		let hasProject = false;
		if (project) {
			// Project too long
			if (project.length > 255) {
				// Return status 422 (unprocessable entity) too long
				return res.status(422).send({
					success: false,
					error: "too_long",
					data: {
						field: "project",
						maxLength: 255,
					},
				});
			}

			// Project too short
			if (project.length < 3) {
				// Return status 422 (unprocessable entity) too short
				return res.status(422).send({
					success: false,
					error: "too_short",
					data: {
						field: "project",
						minLength: 3,
					},
				});
			}
			hasProject = true;
		}

		let hasDescription = false;
		if (description) {
			// Description too long
			if (lastName.length > 255) {
				// Return status 422 (unprocessable entity) too long
				return res.status(422).send({
					success: false,
					error: "too_long",
					data: {
						field: "description",
						maxLength: 255,
					},
				});
			}
			hasDescription = true;
		}

		let hasProjectId = false;
		if (projectId) {
			const [project_result] = await db.query(`SELECT count(*) FROM projects WHERE id = ?`, [projectId]);

			// Project does not exists
			if (project_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) project not found
				return res.status(404).send({ success: false, error: "project_not_found" });
			}
			hasProjectId = true;
		}

		const update = [];

		if (mondayValidation.success && mondayValidation.data) update.push({ name: "monday", value: escape(mondayValidation.data) });
		if (tuesedayValidation.success && tuesedayValidation.data) update.push({ name: "tueseday", value: escape(tuesedayValidation.data) });
		if (wednesdayValidation.success && wednesdayValidation.data) update.push({ name: "wednesday", value: escape(wednesdayValidation.data) });
		if (thursdayValidation.success && thursdayValidation.data) update.push({ name: "thursday", value: escape(thursdayValidation.data) });
		if (fridayValidation.success && fridayValidation.data) update.push({ name: "friday", value: escape(fridayValidation.data) });
		if (saturdayValidation.success && saturdayValidation.data) update.push({ name: "saturday", value: escape(saturdayValidation.data) });
		if (sundayValidation.success && sundayValidation.data) update.push({ name: "sunday", value: escape(sundayValidation.data) });

		if (hasProject) update.push({ name: "project", value: escape(project) });
		if (hasProjectId) update.push({ name: "project_id", value: escape(projectId) });
		if (hasDescription) update.push({ name: "description", value: escape(description) });

		// Update project_hours
		await db.query(
			`UPDATE 
					project_hours
					SET ${update.map((x) => `${x.name} = '${x.value}'`).join(",")}
					WHERE id = '${projectHoursId}'`
		);

		const [results] = await db.query(`SELECT * FROM project_hours WHERE id = ?`, [projectHoursId]);
		if (results.length < 1) {
			// Return status 500 (internal server error) internal
			return res.status(500).send({
				success: false,
				error: "internal",
			});
		}

		return {
			success: true,
			data: results[0],
		};
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({ success: false, error: "mysql" });
	}
});

// Delete whole week
hours.delete("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM hours WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "hours_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM hours WHERE id = ?`, [id]);

		if (delete_results.affectedRows < 1) {
			return res.send({
				success: false,
				error: "failed_to_delete",
			});
		}

		return res.send({
			success: true,
			data: get_results[0],
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});
hours.delete("/:userId/:year/:week", async (req, res) => {
	const { userId, week, year } = req.params;
	try {
		const [get_results] = await db.query(`SELECT * FROM hours WHERE userId = ? AND week = ? AND year = ?`, [userId, week, year]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "hours_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM hours WHERE id = ?`, [get_results[0].id]);

		if (delete_results.affectedRows < 1) {
			return res.send({
				success: false,
				error: "failed_to_delete",
			});
		}

		return res.send({
			success: true,
			data: get_results[0],
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});

// Delete projectHours
hours.delete("/:projectHoursId", async (req, res) => {
	const id = req.params.projectHoursId;
	try {
		const [get_results] = await db.query(`SELECT * FROM project_hours WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "project_hours_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM project_hours WHERE id = ?`, [id]);

		if (delete_results.affectedRows < 1) {
			return res.send({
				success: false,
				error: "failed_to_delete",
			});
		}

		return res.send({
			success: true,
			data: get_results[0],
		});
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({
			success: false,
			error: "mysql",
		});
	}
});

module.exports = hours;
