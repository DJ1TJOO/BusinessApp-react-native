import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import { IconArrowBack } from "../Icons";

const FormButton = ({ children, onPress }) => {
	let child;
	if (typeof children === "string") {
		child = <Text style={styles.buttonText}>{children}</Text>;
	} else {
		child = children;
	}

	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
			{child}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	arrowBack: {
		top: 10,
		width: 20,
		height: 20,
	},
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

FormButton.ArrowBack = <IconArrowBack style={styles.arrowBack} />;

export default FormButton;
