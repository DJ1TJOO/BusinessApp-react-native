const mysql = require("mysql2");
const MySQLEvents = require("@rodrigogs/mysql-events");
const { sendNotification } = require("./notifications");

const configuration = {
	host: "localhost",
	user: "root",
	database: "business_api",
	dateStrings: true,
};
const pool = mysql.createPool(configuration);

const promisePool = pool.promise();

(async () => {
	const events = new MySQLEvents(configuration, {
		startAtEnd: true,
	});

	try {
		await events.start();

		// TODO: add to team, chat messages
		// Check hours being checked
		events.addTrigger({
			name: "listen",
			expression: "business_api.hours.valid",
			statement: MySQLEvents.STATEMENTS.ALL,
			onEvent: async (e) => {
				for (let i = 0; i < e.affectedRows.length; i++) {
					const { before, after } = e.affectedRows[i];
					try {
						const [result] = await promisePool.query(`SELECT notification_token FROM users WHERE id = ?`, [after.user_id]);
						if (result.length < 1) continue;

						// TODO: add routes, badges
						sendNotification({
							to: result[0].notification_token,
							title: `Je uren van week ${after.week} zijn ${after.valid ? "goedgekeurd" : "afgekeurd"}`,
							data: after,
						});
					} catch (error) {
						console.log(error);
					}
				}
			},
		});

		events.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
		events.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
	} catch (error) {
		console.error(error);
	}
})();

module.exports = { pool, promisePool, escape: mysql.escape };
