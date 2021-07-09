import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

const Card = ({ style, color, title, description, onPress, icon, children }) => {
	const Icon = icon;
	return (
		<TouchableOpacity key={title} onPress={onPress}>
			<View style={[styles.card, style]}>
				<View style={styles.header}>
					<Text style={[styles.title, color && { color: color }]}>{title}</Text>
					{Icon && <Icon style={styles.icon} />}
				</View>
				<Text style={[styles.description, color && { color: color }]}>{description}</Text>
				<View>{children}</View>
			</View>
		</TouchableOpacity>
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
	description: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	header: {
		flexDirection: "row",
	},
	icon: {
		width: 25,
		height: 25,
		marginLeft: 10,
	},
	title: {
		color: Colors.textPrimary,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
		marginBottom: -3,
	},
});

export default Card;
