import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

const Card = ({ style, color, title, description, onPress, icon, children }) => {
	const Icon = icon;
	return (
		<TouchableOpacity key={title} onPress={onPress}>
			<View style={[styles.card, style]}>
				{(Icon || title) && (
					<View style={styles.header}>
						<Text style={[styles.title, color && { color: color }]}>{title}</Text>
						{Icon && <Icon style={styles.icon} />}
					</View>
				)}
				{description && <Text style={[styles.description, color && { color: color }]}>{description}</Text>}
				{children}
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
		alignItems: "center",
	},
	icon: {
		width: 25,
		height: 25,
		top: 0,
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
