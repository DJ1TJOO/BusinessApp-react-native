import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

const Message = ({ member = null, name = true, message, date, style }) => {
	const [data, setData] = useContext(dataContext);
	const currentDate = new Date(date);

	return (
		<View style={[styles.card, style, (!member || member.id === data.user.id) && { marginLeft: "10%" }]}>
			{name && member && <Text style={styles.member}>{member.firstName + " " + member.lastName}</Text>}
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
		width: "90%",
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
