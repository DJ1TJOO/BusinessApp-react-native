import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, Text, TextInput, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const FormInput = ({ label, hideText, helpLabel, helpOnPress, onFocus, onBlur, onChange }) => {
	const [isFocused, setIsFocused] = useState(false);
	const [isValid, setIsValid] = useState(null);

	const checkValue = (e) => {
		onChange(e);
	};

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			<TextInput
				style={[styles.input, isFocused && styles.inputFocused, isValid === true && styles.inputValid, isValid === false && styles.inputValid]}
				secureTextEntry={!!hideText}
				onFocus={(e) => {
					setIsFocused(true);
					onFocus && onFocus(e);
				}}
				onBlur={(e) => {
					setIsFocused(false);
					onBlur && onBlur(e);
				}}
				onChange={checkValue}
			/>
			{helpLabel && (
				<TouchableOpacity onPress={helpOnPress}>
					<Text style={styles.helpButtonText}>{helpLabel}</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	label: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	helpButtonText: {
		color: Colors.primary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	input: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		borderRadius: 12,
		borderWidth: 2,
		borderColor: Colors.tertiary,
		paddingHorizontal: 10,
		height: 38,
	},
	inputValid: {
		borderColor: Colors.primary,
	},
	inputInvalid: {
		borderColor: Colors.red,
	},
	inputFocused: {
		color: Colors.textPrimary,
		borderColor: Colors.textPrimary,
	},
});

export default FormInput;
