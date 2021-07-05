import React from "react";
import { StyleSheet, Text } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const FormHeading = ({ title }) => {
	return <Text style={styles.heading}>{title}</Text>;
};

const styles = StyleSheet.create({
	heading: {
		color: Colors.textPrimary,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
		marginTop: 10,
		marginBottom: 1,
	},
});

export default FormHeading;
