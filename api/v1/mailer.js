const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
	const oauth2Client = new OAuth2(process.env.MAIL_CLIENT_ID, process.env.MAIL_CLIENT_SECRET, "https://developers.google.com/oauthplayground");

	oauth2Client.setCredentials({
		refresh_token: process.env.MAIL_REFRESH_TOKEN,
	});

	const accessToken = await new Promise((resolve, reject) => {
		oauth2Client.getAccessToken((err, token) => {
			if (err) {
				reject("Failed to create access token :(");
			}
			resolve(token);
		});
	});

	const transport = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: process.env.MAIL_EMAIL,
			accessToken,
			clientId: process.env.MAIL_CLIENT_ID,
			clientSecret: process.env.MAIL_CLIENT_SECRET,
			refreshToken: process.env.MAIL_REFRESH_TOKEN,
		},
	});

	transport.verify().then(console.log).catch(console.error);

	return transport;
};

//emailOptions - who sends what to whom
const sendEmail = async (emailOptions, callback) => {
	let emailTransporter = await createTransporter();
	emailTransporter.sendMail(emailOptions, callback);
};

module.exports = sendEmail;
