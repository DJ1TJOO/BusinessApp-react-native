import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

const Heading = ({ title, style, containerStyle, icon, onPress }) => {
	return (
		<TouchableWithoutFeedback onPress={onPress}>
			<View style={[styles.container, containerStyle]}>
				{icon && icon}
				<Text style={[styles.heading, style]}>{title}</Text>
			</View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignContent: "center",
	},
	heading: {
		color: Colors.textPrimary,
		fontSize: FontSizes.heading,
		fontFamily: "Segoe-UI",
		marginBottom: 1,
	},
});

export default Heading;
