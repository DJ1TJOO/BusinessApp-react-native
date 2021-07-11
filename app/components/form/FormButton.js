import React from "react";
import { StyleSheet, Text, TouchableOpacity, Platform } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const FormButton = ({ children, onPress, invert, bad }) => {
	let child;
	if (typeof children === "string") {
		child = <Text style={[styles.buttonText, invert && !bad && styles.buttonTextInvert, invert && bad && styles.buttonTextInvertBad]}>{children}</Text>;
	} else {
		child = children;
	}

	return (
		<TouchableOpacity
			style={[styles.button, invert && !bad && styles.buttonInvert, !invert && bad && styles.buttonBad, invert && bad && styles.buttonInvertBad]}
			onPress={onPress}
		>
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
	buttonBad: {
		backgroundColor: Colors.red,
	},
	buttonInvertBad: {
		backgroundColor: Colors.white,
		borderColor: Colors.red,
		borderWidth: 2,
	},
	buttonText: {
		fontSize: FontSizes.subtitle,
		color: Colors.white,
		fontFamily: "Segoe-UI",
		marginTop: Platform.OS === "android" ? 7 : 4,
	},
	buttonTextInvert: { color: Colors.primary, marginTop: 1 },
	buttonTextInvertBad: {
		color: Colors.red,
		marginTop: 1,
	},
});

export default FormButton;
