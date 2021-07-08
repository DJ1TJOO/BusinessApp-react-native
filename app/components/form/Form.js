import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const Form = ({ children, title, onLayout }) => {
	return (
		<View style={styles.form} onLayout={onLayout}>
			<Text style={styles.title}>{title}</Text>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	form: {
		marginHorizontal: 10,
		marginVertical: 5,
	},
	title: {
		color: Colors.textPrimary,
		fontSize: FontSizes.heading,
		fontFamily: "Segoe-UI",
	},
});

export default Form;
