import React, { useEffect, useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import wrapperScrollViewContext from "../../contexts/wrapperScrollViewContext";

const Form = ({ children, title, onLayout, errorLabel, errorOnPress }) => {
	const [currentErrorLabel, setCurrentErrorLabel] = useState(errorLabel);

	const wrapperScrollView = useContext(wrapperScrollViewContext);

	useEffect(() => {
		wrapperScrollView.current.scrollTo({ x: 0, y: 0, animated: true });
	}, [currentErrorLabel]);

	useEffect(() => {
		if (errorLabel !== currentErrorLabel) setCurrentErrorLabel(errorLabel);
	}, [errorLabel]);

	return (
		<View style={styles.form} onLayout={onLayout}>
			<Text style={styles.title}>{title}</Text>
			{currentErrorLabel && (
				<TouchableOpacity onPress={errorOnPress}>
					<Text style={styles.errorButtonText}>{currentErrorLabel}</Text>
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
