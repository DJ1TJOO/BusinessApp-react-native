import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const Message = ({ member = null, message, date, style }) => {
	const currentDate = new Date(date);

	return (
		<View style={[styles.card, style]}>
			{member && <Text style={styles.member}>{member.firstname + " " + member.lastname}</Text>}
			<Text style={[styles.message]}>{message}</Text>
			<Text style={[styles.date]}>
				{currentDate.toLocaleString(undefined, {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		width: "100%",
		backgroundColor: Colors.tertiary,
		borderRadius: 12,
		marginBottom: 5,
		padding: 10,
		paddingTop: 5,
	},
	message: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	date: {
		color: Colors.textSecondary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
		textAlign: "right",
	},
	member: {
		color: Colors.textSecondary,
		fontSize: FontSizes.medium,
		fontFamily: "Segoe-UI",
		marginBottom: -3,
	},
});

export default Message;
