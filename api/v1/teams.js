const { promisePool: db } = require("./helpers/db");
const { dbGenerateUniqueId } = require("./helpers/utils");

const teams = require("express").Router();

// TODO: authorization
// TODO: test
teams.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM teams WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "team_not_found",
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

teams.post("/", async (req, res) => {
	const { name, businessId, chatId, agendaId } = req.body;

	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Chat does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) chat not found
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if  name is correct
		// Name is empty
		if (!name) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "name",
				},
			});
		}

		// Name too long
		if (name.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "name",
					maxLength: 255,
				},
			});
		}

		//  Name too short
		if (name.length < 3) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "name",
					minLength: 3,
				},
			});
		}

		let hasChat = false;
		if (chatId) {
			const [chat_result] = await db.query(`SELECT count(*) FROM chats WHERE id = ?`, [chatId]);

			// Chat does not exists
			if (chat_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) chat not found
				return res.status(404).send({
					success: false,
					error: "chat_not_found",
				});
			}

			hasChat = true;
		}

		let hasAgenda = false;
		if (agendaId) {
			const [agenda_result] = await db.query(`SELECT count(*) FROM agendas WHERE id = ?`, [agendaId]);

			// Agenda does not exists
			if (agenda_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) agenda not found
				return res.status(404).send({
					success: false,
					error: "agenda_not_found",
				});
			}

			hasAgenda = true;
		}

		// Generate id
		const id = await dbGenerateUniqueId("teams", "id");

		// Insert team into db
		await db.query(
			`INSERT INTO 
					teams (id, name, business_id, ${hasChat ? "chat_id," : ""}${hasAgenda ? ", agenda_id" : ""})
					VALUES ('${escape(id)}', '${escape(name)}','${escape(businessId)}',${hasChat ? `'${escape(chatId)}',` : ""}${hasAgenda ? `,'${escape(agendaId)}'` : ""})`
		);

		const [results] = await db.query(`SELECT * FROM teams WHERE id = ?`, [id]);
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

teams.post("/:teamId/", async (req, res) => {
	const { teamId } = req.params;
	const { userId } = req.body;

	try {
		const [get_results] = await db.query(`SELECT count(*) FROM teams WHERE id = ?`, [teamId]);
		if (get_results[0]["count(*)"] < 1) {
			return res.status(404).send({
				success: false,
				error: "team_not_found",
			});
		}

		if (!userId) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "userId",
				},
			});
		}

		const [user_results] = await db.query(`SELECT count(*) FROM users WHERE id = ?`, [userId]);

		// User does not exists
		if (user_results[0]["count(*)"] < 1) {
			// Return status 404 (not found) chat not found
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		// Insert user_team into db
		await db.query(
			`INSERT INTO 
					user_teams (user_id, team_id)
					VALUES (?, ?)`,
			[userId, teamId]
		);

		const [results] = await db.query(`SELECT * FROM user_teams WHERE user_id = ? AND team_id = ?`, [userId, teamId]);
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

teams.patch("/:id", async (req, res) => {
	const { id } = req.params;
	const { name, chatId, agendaId } = req.body;

	try {
		const [get_results] = await db.query(`SELECT count(*) FROM teams WHERE id = ?`, [id]);
		if (get_results[0]["count(*)"] < 1) {
			return res.status(404).send({
				success: false,
				error: "team_not_found",
			});
		}

		// Check if  name is correct
		let hasName = false;
		if (name) {
			// Name too long
			if (name.length > 255) {
				// Return status 422 (unprocessable entity) too long
				return res.status(422).send({
					success: false,
					error: "too_long",
					data: {
						field: "name",
						maxLength: 255,
					},
				});
			}

			//  Name too short
			if (name.length < 3) {
				// Return status 422 (unprocessable entity) too short
				return res.status(422).send({
					success: false,
					error: "too_short",
					data: {
						field: "name",
						minLength: 3,
					},
				});
			}
			hasName = true;
		}

		let hasChat = false;
		if (chatId) {
			const [chat_result] = await db.query(`SELECT count(*) FROM chats WHERE id = ?`, [chatId]);

			// Chat does not exists
			if (chat_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) chat not found
				return res.status(404).send({
					success: false,
					error: "chat_not_found",
				});
			}

			hasChat = true;
		}

		let hasAgenda = false;
		if (agendaId) {
			const [agenda_result] = await db.query(`SELECT count(*) FROM agendas WHERE id = ?`, [agendaId]);

			// Agenda does not exists
			if (agenda_result[0]["count(*)"] < 1) {
				// Return status 404 (not found) agenda not found
				return res.status(404).send({
					success: false,
					error: "agenda_not_found",
				});
			}

			hasAgenda = true;
		}

		const update = [];
		if (hasName) update.push({ name: "name", value: escape(name) });
		if (hasChat) update.push({ name: "chat_id", value: escape(chatId) });
		if (hasAgenda) update.push({ name: "agenda_id", value: escape(agendaId) });

		// Update team
		await db.query(
			`UPDATE 
					users
					SET ${update.map((x) => `${x.name} = '${x.value}'`).join(",")}
					WHERE id = '${id}'`
		);

		const [results] = await db.query(`SELECT * FROM teams WHERE id = ?`, [id]);
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

teams.delete("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const [get_results] = await db.query(`SELECT * FROM teams WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "team_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM teams WHERE id = ?`, [id]);

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

teams.delete("/:teamId/:userId", async (req, res) => {
	const { userId, teamId } = req.params;

	try {
		const [get_results] = await db.query(`SELECT * FROM user_teams WHERE user_id = ? AND team_id = ?`, [userId, teamId]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_team_not_found",
			});
		}

		const [delete_results] = await db.query(`DELETE FROM user_teams WHERE user_id = ? AND team_id = ?`, [userId, teamId]);

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

module.exports = teams;
