import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const Form = ({ children, title, onLayout, errorLabel, errorOnPress }) => {
	return (
		<View style={styles.form} onLayout={onLayout}>
			<Text style={styles.title}>{title}</Text>
			{errorLabel && (
				<TouchableOpacity onPress={errorOnPress}>
					<Text style={styles.errorButtonText}>{errorLabel}</Text>
				</TouchableOpacity>
			)}
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	errorButtonText: {
		color: Colors.red,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
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
