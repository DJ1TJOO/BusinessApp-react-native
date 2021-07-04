import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import Colors from "../../config/Colors";

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
		paddingBottom: 7,
		borderRadius: 6,
		marginTop: 5,
		width: "100%",
		alignItems: "center",
		height: 48,
	},
	buttonText: {
		fontSize: 30,
		color: Colors.white,
		fontFamily: "Segoe-UI",
	},
});

export default FormButton;
