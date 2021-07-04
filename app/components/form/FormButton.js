import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const FormButton = ({ children, onPress }) => {
	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
			<Text style={styles.buttonText}>{children}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: Colors.primary,
		borderRadius: 6,
		marginTop: 5,
		width: "100%",
		alignItems: "center",
		height: 38,
	},
	buttonText: {
		fontSize: FontSizes.title,
		color: Colors.white,
		fontFamily: "Segoe-UI",
	},
});

export default FormButton;
