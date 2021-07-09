import React from "react";
import { StyleSheet, Text } from "react-native";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

const Heading = ({ title, style }) => {
	return <Text style={[styles.heading, style]}>{title}</Text>;
};

const styles = StyleSheet.create({
	heading: {
		color: Colors.textPrimary,
		fontSize: FontSizes.heading,
		fontFamily: "Segoe-UI",
		marginBottom: 1,
	},
});

export default Heading;
