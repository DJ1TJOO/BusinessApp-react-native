const { authToken, authRights } = require("./helpers/auth");
const { promisePool: db } = require("./helpers/db");
const { objectToResponse, dbGenerateUniqueId } = require("./helpers/utils");
const { v4: uuid } = require("uuid");

const chats = require("express").Router();

chats.get("/", authToken, async (req, res) => {
	try {
		const [results] = await db.query(`SELECT chats.* FROM chats LEFT JOIN user_chats ON chats.id = user_chats.chat_id WHERE user_chats.user_id = ? AND chats.business_id = ?`, [
			req.token.id,
			req.token.businessId,
		]);

		const chats = await Promise.all(
			results.map(async (chat) => {
				// Add members
				const [members] = await db.query(`SELECT user_id FROM user_chats WHERE chat_id = ?`, [chat.id]);
				chat.members = members.map((x) => x.user_id);

				// Add last message
				const [messages] = await db.query(`SELECT messages.*
                                                    FROM (
                                                        SELECT *
                                                        FROM messages
                                                        ORDER BY messages.created DESC
                                                        LIMIT 1
                                                    ) messages
                                                    ORDER BY messages.created`);
				chat.lastMessage = messages.length > 0 ? { ...messages[0], created: messages[0].created.replace(" ", "T") } : null;

				return chat;
			})
		);

		return res.send({
			success: true,
			data: chats,
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

chats.get("/:id", authToken, async (req, res) => {
	const { id } = req.params;
	try {
		const [results] = await db.query(`SELECT * FROM chats WHERE id = ? AND business_id = ?`, [id, req.token.businessId]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "chat_not_found",
			});
		}

		const [user_results] = await db.query(`SELECT count(*) FROM user_chats WHERE user_id = ? and chat_id = ?`, [req.token.id, id]);

		if (user_results[0]["count(*)"] < 1) {
			return res.status(403).send({
				success: false,
				error: "forbidden",
			});
		}

		// Add members
		const [members] = await db.query(`SELECT user_id FROM user_chats WHERE chat_id = ?`, [results[0].id]);
		results[0].members = members.map((x) => x.user_id);

		// Add last message
		const [messages] = await db.query(`SELECT messages.*
                                                    FROM (
                                                        SELECT *
                                                        FROM messages
                                                        ORDER BY messages.created DESC
                                                        LIMIT 1
                                                    ) messages
                                                    ORDER BY messages.created`);
		results[0].lastMessage = messages.length > 0 ? { ...messages[0], created: messages[0].created.replace(" ", "T") } : null;

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

chats.get("/messages/:id/:amount/:start?", authToken, async (req, res) => {
	const { id, amount, start } = req.params;
	try {
		const [results] = await db.query(`SELECT count(*) FROM chats WHERE id = ? AND business_id = ?`, [id, req.token.businessId]);
		if (results[0]["count(*)"] < 1) {
			return res.status(404).send({
				success: false,
				error: "chat_not_found",
			});
		}

		const [user_results] = await db.query(`SELECT count(*) FROM user_chats WHERE user_id = ? and chat_id = ?`, [req.token.id, id]);

		if (user_results[0]["count(*)"] < 1) {
			return res.status(403).send({
				success: false,
				error: "forbidden",
			});
		}

		const [message_results] = await db.query(`SELECT messages.*
                                                    FROM (
                                                        SELECT *
                                                        FROM messages
                                                        ORDER BY messages.created DESC
                                                        LIMIT ${amount} OFFSET ${start || 0}
                                                    ) messages
                                                    ORDER BY messages.created
                                                    `);

		return res.send({
			success: true,
			data: message_results.map((x) => ({ ...x, created: x.created.replace(" ", "T") })),
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

chats.post("/", authToken, async (req, res) => {
	const { description, businessId, randomName } = req.body;
	let { name } = req.body;
	try {
		const [business_result] = await db.query(`SELECT count(*) FROM business WHERE id = ?`, [businessId]);

		// Business does not exists
		if (business_result[0]["count(*)"] < 1) {
			// Return status 404 (not found) chat not found
			return res.status(404).send({
				success: false,
				error: "business_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([], req.token, businessId);
		if (!auth.success) return objectToResponse(res, auth);

		// Check if  name is correct
		// Name is empty
		if (!name && !randomName) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "name",
				},
			});
		} else if (randomName) {
			name = uuid();
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

		// Check if description is specified
		let hasDescription = false;
		if (description) {
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

		// Generate id
		const id = await dbGenerateUniqueId("chats", "id");

		// Insert team into db
		await db.query(
			`INSERT INTO 
					chats (id, name, business_id ${hasDescription ? ", description" : ""})
					VALUES ('${escape(id)}', '${escape(name)}','${escape(businessId)}'${hasDescription ? `',${escape(description)}'` : ""})`
		);

		const [results] = await db.query(`SELECT * FROM chats WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "chat_not_found",
			});
		}

		// Add user to chat
		await db.query(`INSERT INTO user_chats (user_id, chat_id) VALUES ('${escape(req.token.id)}', '${escape(id)}')`);

		// Add members
		const [members] = await db.query(`SELECT user_id FROM user_chats WHERE chat_id = ?`, [results[0].id]);
		results[0].members = members.map((x) => x.user_id);

		// Add last message
		const [messages] = await db.query(`SELECT messages.*
                                                    FROM (
                                                        SELECT *
                                                        FROM messages
                                                        ORDER BY messages.created DESC
                                                        LIMIT 1
                                                    ) messages
                                                    ORDER BY messages.created`);
		results[0].lastMessage = messages.length > 0 ? { ...messages[0], created: messages[0].created.replace(" ", "T") } : null;

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

chats.post("/:id", authToken, async (req, res) => {
	const { id } = req.params;
	const { userId } = req.body;

	try {
		const [get_results] = await db.query(`SELECT * FROM chats WHERE id = ?`, [id]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "chat_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([], req.token, get_results[0].business_id);
		if (!auth.success) return objectToResponse(res, auth);

		const [user_results] = await db.query(`SELECT business_id FROM users WHERE id = ?`, [userId]);
		if (user_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "user_not_found",
			});
		}

		// Check if user is from same business
		if (user_results[0].business_id !== get_results[0].business_id) {
			return res.status(403).send({ success: false, error: "forbidden" });
		}

		// Add members
		const [members] = await db.query(`SELECT user_id FROM user_chats WHERE chat_id = ?`, [get_results[0].id]);
		get_results[0].members = members.map((x) => x.user_id);
		if (!get_results[0].members.includes(req.token.id)) {
			return res.status(403).send({ success: false, error: "forbidden" });
		}

		// Add user to chat
		await db.query(`INSERT INTO user_chats (user_id, chat_id) VALUES ('${escape(userId)}', '${escape(id)}')`);

		get_results[0].members.push(userId);

		// Add last message
		const [messages] = await db.query(`SELECT messages.*
                                                    FROM (
                                                        SELECT *
                                                        FROM messages
                                                        ORDER BY messages.created DESC
                                                        LIMIT 1
                                                    ) messages
                                                    ORDER BY messages.created`);
		get_results[0].lastMessage = messages.length > 0 ? { ...messages[0], created: messages[0].created.replace(" ", "T") } : null;

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

chats.post("/:chatId/message", authToken, async (req, res) => {
	const { chatId } = req.params;
	const { message } = req.body;

	try {
		const [get_results] = await db.query(`SELECT business_id FROM chats WHERE id = ?`, [chatId]);
		if (get_results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "chat_not_found",
			});
		}

		// Check if user has rights
		const auth = await authRights([], req.token, get_results[0].business_id);
		if (!auth.success) return objectToResponse(res, auth);

		// Add members
		const [members] = await db.query(`SELECT user_id FROM user_chats WHERE chat_id = ?`, [chatId]);
		get_results[0].members = members.map((x) => x.user_id);
		if (!get_results[0].members.includes(req.token.id)) {
			return res.status(403).send({ success: false, error: "forbidden" });
		}

		// Check if  message is correct
		// Message is empty
		if (!message) {
			// Return status 422 (unprocessable entity) empty
			return res.status(422).send({
				success: false,
				error: "empty",
				data: {
					field: "message",
				},
			});
		}

		// Message too long
		if (message.length > 255) {
			// Return status 422 (unprocessable entity) too long
			return res.status(422).send({
				success: false,
				error: "too_long",
				data: {
					field: "message",
					maxLength: 255,
				},
			});
		}

		//  Message too short
		if (message.length < 1) {
			// Return status 422 (unprocessable entity) too short
			return res.status(422).send({
				success: false,
				error: "too_short",
				data: {
					field: "message",
					minLength: 1,
				},
			});
		}

		// Generate id
		const id = await dbGenerateUniqueId("messages", "id");

		// Create message
		await db.query(`INSERT INTO messages (id, chat_id, user_id, message) VALUES ('${escape(id)}', '${escape(chatId)}', '${escape(req.token.id)}', '${escape(message)}')`);

		const [results] = await db.query(`SELECT * FROM messages WHERE id = ?`, [id]);
		if (results.length < 1) {
			return res.status(404).send({
				success: false,
				error: "message_not_found",
			});
		}
		results[0].created = results[0].created.replace(" ", "T");

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

// TODO: add user to chat, patch, delete, delete user from chat

module.exports = chats;
