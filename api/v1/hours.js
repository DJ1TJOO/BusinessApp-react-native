const { authToken, authRights } = require("./helpers/auth");
const { promisePool: db, escape } = require("./helpers/db");
const { dbGenerateUniqueId, objectToResponse } = require("./helpers/utils");
const availableRights = require("./availableRights.json");

const hours = require("express").Router();

/**
 * @param {{
 *  [key]: String,
 * }} params
 */
const getHours = async (params, token) => {
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

		// Users can get there own hours
		if (results.some((x) => x.user_id !== token.id)) {
			// Check if user has rights
			const auth = await authRights([availableRights.GET_HOURS], token, results[0].business_id);
			if (!auth.success) return auth;
		}

		const mappedResults = results.map((x) => ({
			...x,
			valid: x.valid === 1 ? true : x.valid === 0 ? false : null,
			submitted: x.submitted === 1 ? true : x.submitted === 0 ? false : null,
		}));
		if (results.length === 1) {
			return await addProjectHours(mappedResults[0]);
		}

		const data = [];
		for (let i = 0; i < results.length; i++) {
			const { success, ...hours } = await addProjectHours(mappedResults[i]);

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
		const [hoursResults] = await db.query(
			`SELECT project_hours.id,project_hours.project,project_hours.project_id,project_hours.description,project_hours.monday,project_hours.tuesday,project_hours.wednesday,project_hours.thursday,project_hours.friday,project_hours.saturday,project_hours.sunday,projects.name AS projectName FROM project_hours LEFT JOIN projects ON project_hours.project_id = projects.id WHERE hours_id = ?`,
			[hours.id]
		);

		return {
			success: true,
			data: {
				...hours,
				hours: hoursResults,
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

hours.get("/:id", authToken, async (req, res) => {
	const { id } = req.params;
	return objectToResponse(res, await getHours({ id }, req.token));
});

// Get hours from user overall, year, week
hours.get("/users/:userId/:year?/:week?", authToken, async (req, res) => {
	const { userId, year, week } = req.params;

	const params = { user_id: userId };
	if (week) params.week = week;
	if (year) params.year = year;

	// Week fist is faster
	return objectToResponse(res, await getHours(params, req.token));
});

// Get hours from business overall, year, week
hours.get("/business/:businessId/:year?/:week?", authToken, async (req, res) => {
	const { businessId, year, week } = req.params;

	const params = { business_id: businessId };
	if (week) params.week = week;
	if (year) params.year = year;

	// Week fist is faster
	return objectToResponse(res, await getHours(params, req.token));
});

const createHours = async (body, token) => {
	const { userId, businessId, week, year } = body;
	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Busines does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) business not found
			return { status: 404, success: false, error: "business_not_found" };
		}

		// User can create own hours
		if (userId !== token.id) {
			// Check if user has rights
			const auth = await authRights([availableRights.CREATE_HOURS], token, businessId);
			if (!auth.success) return auth;
		}

		const [user_result] = await db.query(`SELECT count(*) FROM users WHERE id = ? AND business_id`, [userId, businessId]);

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
		if (isNaN(year)) {
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
		if (isNaN(week)) {
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

hours.post("/", authToken, async (req, res) => {
	return objectToResponse(res, await createHours(req.body, req.token));
});

const validateNumber = (field, value, min, max, checkEmpty = true) => {
	// Check value
	// Value is empty
	if ((typeof value === "undefined" || value === null) && checkEmpty) {
		// Return status 422 (unprocessable entity) empty
		return {
			status: 422,
			success: false,
			error: "empty",
			data: {
				field,
			},
		};
	} else if ((typeof value === "undefined" || value === null) && !checkEmpty) {
		return {
			success: true,
			data: null,
		};
	}

	// Invalid value
	if (isNaN(value)) {
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
	const { project, projectName, description, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = body;
	try {
		// Check monday
		const mondayValidation = validateNumber("monday", monday, 0, 24);
		if (!mondayValidation.success) return mondayValidation;

		// Check tuesday
		const tuesdayValidation = validateNumber("tuesday", tuesday, 0, 24);
		if (!tuesdayValidation.success) return tuesdayValidation;

		// Check wednesday
		const wednesdayValidation = validateNumber("wednesday", wednesday, 0, 24);
		if (!wednesdayValidation.success) return wednesdayValidation;

		// Check thursday
		const thursdayValidation = validateNumber("thursday", thursday, 0, 24);
		if (!thursdayValidation.success) return thursdayValidation;

		// Check friday
		const fridayValidation = validateNumber("friday", friday, 0, 24);
		if (!fridayValidation.success) return fridayValidation;

		// Check saturday
		const saturdayValidation = validateNumber("saturday", saturday, 0, 24);
		if (!saturdayValidation.success) return saturdayValidation;

		// Check sunday
		const sundayValidation = validateNumber("sunday", sunday, 0, 24);
		if (!sundayValidation.success) return sundayValidation;

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
			if (description.length > 255) {
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
		let projectId = null;
		if (projectName) {
			const [project_result] = await db.query(`SELECT id FROM projects WHERE name = ?`, [projectName]);

			// Project does not exists
			if (project_result.length < 1) {
				// Return status 404 (not found) project not found
				return {
					status: 404,
					success: false,
					error: "project_not_found",
					data: {
						field: "projectName",
					},
				};
			}
			projectId = project_result[0].id;
			hasProjectId = true;
		}

		// Generate id
		const id = await dbGenerateUniqueId("project_hours", "id");

		// Insert hours into db
		await db.query(
			`INSERT INTO 
					project_hours (id, hours_id, project, ${hasProjectId ? "project_id," : ""} ${hasDescription ? "description," : ""} monday, tuesday, wednesday, thursday, friday, saturday, sunday)
					VALUES (${escape(id)}, ${escape(hoursId)},${escape(project)}, ${hasProjectId ? `${escape(projectId)},` : ""} ${hasDescription ? `${escape(description)},` : ""} ${escape(
				monday
			)}, ${escape(tuesday)}, ${escape(wednesday)}, ${escape(thursday)}, ${escape(friday)}, ${escape(saturday)}, ${escape(sunday)})`
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

hours.post("/:hoursId", authToken, async (req, res) => {
	const { hoursId } = req.params;

	try {
		const [hours_result] = await db.query(`SELECT user_id,business_id FROM hours WHERE id = ?`, [hoursId]);

		// Hours does not exists
		if (hours_result.length < 1) {
			// Return status 404 (not found) hours not found
			return res.status(404).send({ success: false, error: "hours_not_found" });
		}

		// User can create own project hours
		if (hours_result[0].user_id !== req.token.id) {
			// Check if user has rights
			const auth = await authRights([availableRights.CREATE_HOURS], req.token, hours_result[0].business_id);
			if (!auth.success) return objectToResponse(res, auth);
		}

		return objectToResponse(res, await createProjectHours(hoursId, req.body));
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({ success: false, error: "mysql" });
	}
});

hours.post("/:userId/:year/:week", authToken, async (req, res) => {
	const { userId, week, year } = req.params;

	try {
		// Get id
		let id = null;
		const [hours_result] = await db.query(`SELECT id,business_id FROM hours WHERE user_id = ? AND week = ? AND year = ?`, [userId, week, year]);

		// Hours does not exists
		if (hours_result.length < 1) {
			// User can create own project hours
			if (userId !== req.token.id) {
				// Check if user has rights
				const auth = await authRights([availableRights.CREATE_HOURS], req.token, req.token.businessId);
				if (!auth.success) return objectToResponse(res, auth);
			}

			const hours = await createHours({ ...req.body, week, year, userId, businessId: req.token.businessId }, req.token);

			if (!hours.success) {
				// Return error creating hours
				return objectToResponse(res, hours);
			}

			id = hours.data.id;
		} else {
			// User can create own project hours
			if (userId !== req.token.id) {
				// Check if user has rights
				const auth = await authRights([availableRights.CREATE_HOURS], req.token, hours_result[0].business_id);
				if (!auth.success) return objectToResponse(res, auth);
			}

			id = hours_result[0].id;
		}

		return objectToResponse(res, await createProjectHours(id, req.body, req.token));
	} catch (error) {
		// Mysql error
		console.log(error);
		// Return status 500 (internal server error) mysql
		return res.status(500).send({ success: false, error: "mysql" });
	}
});

hours.patch("/:id", authToken, async (req, res) => {
	const { id } = req.params;
	const { valid, submitted } = req.body;
	try {
		// Check if hours exists
		const [getResults] = await db.query(`SELECT valid,submitted,business_id FROM hours WHERE id = ?`, [id]);
		if (getResults.length < 1) {
			return res.status(404).send({
				success: false,
				error: "hours_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([availableRights.CHECK_HOURS], req.token, getResults[0].business_id);
		if (!auth.success) return objectToResponse(res, auth);

		// Submitted specified
		let hasSubmitted = false;
		if (typeof submitted !== "undefined" && getResults[0].submitted !== submitted) {
			// Not boolean and not null
			if (typeof submitted !== "boolean" && submitted !== null) {
				// Return status 422 (unprocessable entity) incorrect
				return res.status(422).send({
					success: false,
					error: "invalid",
					data: {
						field: "submitted",
					},
				});
			}

			hasSubmitted = true;
		}

		// Valid specified
		let hasValid = false;
		if (typeof valid !== "undefined" && getResults[0].valid !== valid) {
			// Not boolean and not null
			if (typeof valid !== "boolean" && valid !== null) {
				// Return status 422 (unprocessable entity) incorrect
				return res.status(422).send({
					success: false,
					error: "invalid",
					data: {
						field: "valid",
					},
				});
			}

			hasValid = true;
		}

		const update = [];
		if (hasSubmitted) update.push({ name: "submitted", value: submitted });
		if (hasValid) update.push({ name: "valid", value: valid });

		// Update hours
		if (update.length > 0) {
			await db.query(
				`UPDATE 
					hours
					SET ${update.map((x) => `${x.name} = ${x.value}`).join(",")}
					WHERE id = ?`,
				[id]
			);
		}

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

hours.patch("/project/:projectHoursId", authToken, async (req, res) => {
	const { projectHoursId } = req.params;
	const { project, projectName, description, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
	try {
		const [get_results] = await db.query(
			`SELECT project_hours.project,project_hours.project_id,project_hours.description,project_hours.monday,project_hours.tuesday,project_hours.wednesday,project_hours.thursday,project_hours.friday,project_hours.saturday,project_hours.sunday,hours.user_id,hours.business_id FROM project_hours INNER JOIN hours ON project_hours.hours_id = hours.id WHERE project_hours.id = ?`,
			[projectHoursId]
		);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "project_hours_not_found",
			});
		}

		// User can change own project hours
		if (get_results[0].user_id !== req.token.id) {
			// Check if user has rights
			const auth = await authRights([availableRights.CHANGE_HOURS], req.token, get_results[0].business_id);
			if (!auth.success) return objectToResponse(res, auth);
		}

		// Check monday
		const mondayValidation = validateNumber("monday", monday, 0, 24, false);
		if (!mondayValidation.success) return objectToResponse(res, mondayValidation);

		// Check tuesday
		const tuesdayValidation = validateNumber("tuesday", tuesday, 0, 24, false);
		if (!tuesdayValidation.success) return objectToResponse(res, tuesdayValidation);

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
		if (project && get_results[0].project !== project) {
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
		if (description && get_results[0].description !== description) {
			// Description too long
			if (description.length > 255) {
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
		let projectId = null;
		if (projectName) {
			const [project_result] = await db.query(`SELECT id FROM projects WHERE name = ?`, [projectName]);

			// Project does not exists
			if (project_result.length < 1) {
				// Return status 404 (not found) project not found
				return res.status(404).send({
					success: false,
					error: "project_not_found",
					data: {
						field: "projectName",
					},
				});
			}

			projectId = project_result[0].id;
			if (get_results[0].project_id !== projectId) {
				hasProjectId = true;
			}
		}

		const update = [];

		if (mondayValidation.success && mondayValidation.data && mondayValidation.data !== get_results[0].monday)
			update.push({ name: "monday", value: escape(mondayValidation.data) });
		if (tuesdayValidation.success && tuesdayValidation.data && tuesdayValidation.data !== get_results[0].tuesday)
			update.push({ name: "tuesday", value: escape(tuesdayValidation.data) });
		if (wednesdayValidation.success && wednesdayValidation.data && wednesdayValidation.data !== get_results[0].wednesday)
			update.push({ name: "wednesday", value: escape(wednesdayValidation.data) });
		if (thursdayValidation.success && thursdayValidation.data && thursdayValidation.data !== get_results[0].thursday)
			update.push({ name: "thursday", value: escape(thursdayValidation.data) });
		if (fridayValidation.success && fridayValidation.data && fridayValidation.data !== get_results[0].friday)
			update.push({ name: "friday", value: escape(fridayValidation.data) });
		if (saturdayValidation.success && saturdayValidation.data && saturdayValidation.data !== get_results[0].saturday)
			update.push({ name: "saturday", value: escape(saturdayValidation.data) });
		if (sundayValidation.success && sundayValidation.data && sundayValidation.data !== get_results[0].sunday)
			update.push({ name: "sunday", value: escape(sundayValidation.data) });

		if (hasProject) update.push({ name: "project", value: escape(project) });
		if (hasProjectId)
			update.push({
				name: "project_id",
				value: escape(projectId),
			});
		if (hasDescription) update.push({ name: "description", value: escape(description) });

		// Update project_hours
		if (update.length > 0) {
			await db.query(
				`UPDATE 
					project_hours
					SET ${update.map((x) => `${x.name} = ${x.value}`).join(",")}
					WHERE id = '${projectHoursId}'`
			);
		}

		const [results] = await db.query(`SELECT * FROM project_hours WHERE id = ?`, [projectHoursId]);
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
		return res.status(500).send({ success: false, error: "mysql" });
	}
});

// Delete whole week
hours.delete("/:id", authToken, async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM hours WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "hours_not_found",
			});
		}

		// User can delete own hours
		if (get_results[0].user_id !== req.token.id) {
			// Check if user has rights
			const auth = await authRights([availableRights.DELETE_HOURS], req.token, get_results[0].business_id);
			if (!auth.success) return objectToResponse(res, auth);
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

hours.delete("/:userId/:year/:week", authToken, async (req, res) => {
	const { userId, week, year } = req.params;
	try {
		const [get_results] = await db.query(`SELECT * FROM hours WHERE user_id = ? AND week = ? AND year = ?`, [userId, week, year]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "hours_not_found",
			});
		}

		// User can delete own hours
		if (get_results[0].user_id !== req.token.id) {
			// Check if user has rights
			const auth = await authRights([availableRights.DELETE_HOURS], req.token, get_results[0].business_id);
			if (!auth.success) return objectToResponse(res, auth);
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
hours.delete("/project/:projectHoursId", authToken, async (req, res) => {
	const id = req.params.projectHoursId;
	try {
		const [get_results] = await db.query(
			`SELECT project_hours.*,hours.user_id,hours.business_id FROM project_hours INNER JOIN hours ON project_hours.hours_id = hours.id WHERE id = ?`,
			[id]
		);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "project_hours_not_found",
			});
		}

		const { business_id, user_id, ...projectHours } = get_results[0];

		// User can delete own project hours
		if (user_id !== req.token.id) {
			// Check if user has rights
			const auth = await authRights([availableRights.DELETE_HOURS], req.token, business_id);
			if (!auth.success) return objectToResponse(res, auth);
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
			data: projectHours,
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
