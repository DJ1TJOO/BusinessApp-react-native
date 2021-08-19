const { Expo, ExpoPushErrorTicket, ExpoPushErrorReceipt, ExpoPushMessage } = require("expo-server-sdk");
const { promisePool: db, escape } = require("./db");
const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

const expo = new Expo({ accessToken: process.env.EXPO_NOTIFICATION_TOKEN });

const getMessagesFile = () => {
	try {
		// Check if messages file exists
		if (!fs.existsSync(process.env.NOTIFICATION_MESSAGES_LOCATION)) {
			// Make dir
			const dirname = path.dirname(process.env.NOTIFICATION_MESSAGES_LOCATION);
			if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

			// Make file
			fs.writeFileSync(process.env.NOTIFICATION_MESSAGES_LOCATION, JSON.stringify({ messages: [], pendingMessages: [] }));
		}

		return JSON.parse(fs.readFileSync(process.env.NOTIFICATION_MESSAGES_LOCATION));
	} catch (error) {
		console.log(error);
		return null;
	}
};

const updateMessagesStorageTo = (messages) => {
	try {
		if (!Array.isArray(messages)) return false;
		const messagesFile = getMessagesFile();
		if (!messagesFile) return false;
		messagesFile.messages = messages;

		fs.writeFileSync(process.env.NOTIFICATION_MESSAGES_LOCATION, JSON.stringify(messagesFile));
		return true;
	} catch (error) {
		return false;
	}
};

const addToPendingMessagesStorage = (pendingMessages) => {
	try {
		if (!Array.isArray(pendingMessages)) return false;
		const messagesFile = getMessagesFile();
		if (!messagesFile) return false;
		messagesFile.pendingMessages.push(...pendingMessages);

		// Remove duplicates, no need to send the same message mutliple times
		messagesFile.pendingMessages = messagesFile.pendingMessages.filter((elem, index, self) => index === self.indexOf(elem));

		fs.writeFileSync(process.env.NOTIFICATION_MESSAGES_LOCATION, JSON.stringify(messagesFile));
		return true;
	} catch (error) {
		return false;
	}
};

const removeFromPendingMessagesStorage = (pendingMessages) => {
	try {
		if (!Array.isArray(pendingMessages)) return false;
		const messagesFile = getMessagesFile();
		if (!messagesFile) return false;

		// Remove messages
		for (let i = 0; i < pendingMessages.length; i++) {
			messagesFile.pendingMessages.splice(messagesFile.pendingMessages.indexOf(pendingMessages[i]), 1);
		}

		fs.writeFileSync(process.env.NOTIFICATION_MESSAGES_LOCATION, JSON.stringify(messagesFile));
		return true;
	} catch (error) {
		return false;
	}
};

const sendChunks = async (messages) => {
	const tickets = [];

	try {
		// Create chunks
		const chunks = expo.chunkPushNotifications(messages);
		for (const chunk of chunks) {
			try {
				// Send chunk
				const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

				// Check for ticket errors
				for (let i = 0; i < ticketChunk.length; i++) {
					/** @type {ExpoPushErrorTicket} */
					const ticket = ticketChunk[i];
					ticket.message;

					// No errors
					if (!ticket.details || !ticket.details.error) {
						tickets.push({ ticket, message: chunk[i] });
						continue;
					}

					// Handle error
					if (ticket.details.error === "DeviceNotRegistered") {
						try {
							await db.query(`UPDATE users SET notification_token = NULL WHERE notification_token = ?`, [chunk[i].to]);
						} catch (error) {
							console.log(error);
						}
					}
				}
			} catch (error) {
				console.log(error);
			}
		}
	} catch (error) {
		console.log(error);
	}

	// Add to pending messages
	addToPendingMessagesStorage(tickets);

	// After 15 min handle tickets
	setTimeout(() => {
		handleTickets(tickets);
	}, 1000 * 60 * 15);
};

const handleTickets = async (ticketMessages) => {
	// Get ids
	const receiptIds = ticketMessages.map((x) => x.token.id).filter((x) => typeof x !== "undefined");

	try {
		// Create chunks
		const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
		for (const chunk of receiptIdChunks) {
			try {
				// Send chunk
				const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

				// Check for errors
				for (let i = 0; i < receipts.length; i++) {
					/** @type {ExpoPushErrorReceipt} */
					const { status, details } = receipts[i];

					// No error
					if (status !== "error" || !details || !details.error) {
						continue;
					}

					// Get ticket en message
					const { ticket, message } = ticketMessages.find((x) => x.token.id === receiptIds[i]);

					// TODO: Handle errors
					if (details.error === "DeviceNotRegistered") {
						try {
							await db.query(`UPDATE users SET notification_token = NULL WHERE notification_token = ?`, [message.to]);
						} catch (error) {
							console.log(error);
						}
					} else if (details.error === "MessageTooBig") {
						console.error({
							name: "notifications",
							error: "MessageTooBig",
							max: 4096,
						});
					} else if (details.error === "MessageRateExceeded") {
						console.error({
							name: "notifications",
							error: "MessageRateExceeded",
						});
					} else if (details.error === "InvalidCredentials") {
						console.error({
							name: "notifications",
							error: "InvalidCredentials",
						});
					}
				}

				removeFromPendingMessagesStorage(ticketMessages);
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
};

/**
 * @param {ExpoPushMessage} message
 * @param {Boolean} realTime
 * @returns {Boolean}
 */
const sendNotification = (message, realTime = false) => {
	if (!Expo.isExpoPushToken(message.to)) {
		return false;
	}

	messages.push({
		...message,
		realTime,
	});

	return true;
};

let currentTimeout = null;

/**
 * @type {Array<ExpoPushMessage>}
 */
const messages = new Proxy([], {
	apply: function (target, thisArg, argumentsList) {
		return thisArg[target].apply(this, argumentList);
	},
	deleteProperty: function (target, property) {
		return true;
	},
	set: function (target, property, value, receiver) {
		target[property] = value;

		if (property === "length") {
			// Max length of message chunks is 100
			if (value >= 100) {
				sendChunks(target);
				// Reset messages
				target.splice(0, target.length);
			} else if (value > 0 && !currentTimeout) {
				// Wait one minute to gether more messages
				currentTimeout = setTimeout(() => {
					// Send messages
					sendChunks(messages);
					// Clear messages array
					messages.splice(0, messages.length);
					// Reset timeout
					currentTimeout = null;
				}, 1000 * 60 * 1);
			}

			// Update messages storage
			updateMessagesStorageTo(messages);
		} else {
			// Real time notification
			if (typeof value === "object" && value.realTime) {
				// Send messages
				sendChunks(messages);
				// Clear messages array
				messages.splice(0, messages.length);
				// Reset timeout
				currentTimeout = null;
			}
		}

		return true;
	},
});

// Check for pending messages and messages
const messagesFile = getMessagesFile();
if (messagesFile) {
	// Send last messages
	sendChunks(messagesFile.messages);

	// Check for pending messages after 15 minutes
	setTimeout(() => {
		handleTickets(messagesFile.pendingMessages);
	}, 1000 * 60 * 15);

	// Clear storage
	updateMessagesStorageTo([]);
	removeFromPendingMessagesStorage(messagesFile.pendingMessages);
}

module.exports = { sendNotification };
