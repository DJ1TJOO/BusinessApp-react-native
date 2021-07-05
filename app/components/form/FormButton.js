import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import { IconAgenda, IconArrowBack } from "../Icons";

const FormButton = ({ children, onPress, invert }) => {
	let child;
	if (typeof children === "string") {
		child = <Text style={invert ? [styles.buttonText, styles.buttonTextInvert] : styles.buttonText}>{children}</Text>;
	} else {
		child = children;
	}

	return (
		<TouchableOpacity style={invert ? [styles.button, styles.buttonInvert] : styles.button} onPress={onPress}>
			{child}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: Colors.primary,
		borderRadius: 12,
		marginTop: 5,
		width: "100%",
		alignItems: "center",
		height: 38,
	},
	buttonInvert: {
		backgroundColor: Colors.white,
		borderColor: Colors.primary,
		borderWidth: 2,
	},
	buttonText: {
		fontSize: FontSizes.subtitle,
		color: Colors.white,
		fontFamily: "Segoe-UI",
		marginTop: 4,
	},
	buttonTextInvert: { color: Colors.primary, marginTop: 1 },
});

export default FormButton;
