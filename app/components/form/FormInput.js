import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, Text, TextInput, View, textContentType } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import { IconCheck, IconCross } from "../Icons";

const FormInput = ({ label, hideText, helpLabel, helpOnPress, errorLabel, errorOnPress, valid, onFocus, onBlur, onChange, validate, textContentType }) => {
	const [currentErrorLabel, setCurrentErrorLabel] = useState(errorLabel);
	const [isFocused, setIsFocused] = useState(false);
	const [isValid, setIsValid] = useState(valid);

	const checkValue = (text) => {
		if (!text) return;

		if (validate) {
			const valid = validate(text);
			if (valid === true) {
				setCurrentErrorLabel(null);
				setIsValid(true);
			} else {
				setCurrentErrorLabel(valid);
				setIsValid(false);
			}
		}
		if (onChange) onChange(text);
	};

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			{currentErrorLabel && (
				<TouchableOpacity onPress={errorOnPress}>
					<Text style={styles.errorButtonText}>{currentErrorLabel}</Text>
				</TouchableOpacity>
			)}
			<View>
				{isValid === true && (
					<IconCheck
						style={[
							styles.icon,
							{
								marginLeft: -35,
							},
						]}
					/>
				)}
				{isValid === false && <IconCross style={[styles.icon]} />}
				<TextInput
					clearTextOnFocus={false}
					style={[styles.input, isFocused && styles.inputFocused, isValid === true && styles.inputValid, isValid === false && styles.inputInvalid]}
					secureTextEntry={!!hideText}
					onFocus={(e) => {
						setIsFocused(true);
						onFocus && onFocus(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						onBlur && onBlur(e);
					}}
					textContentType={textContentType}
					onChangeText={(text) => checkValue(text)}
				></TextInput>
			</View>
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
	errorButtonText: {
		color: Colors.red,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	helpButtonText: {
		color: Colors.primary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	icon: {
		position: "absolute",
		top: 10,
		left: "100%",
		marginLeft: -28,
		width: 30,
		height: 30,
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
		color: Colors.primary,
	},
	inputInvalid: {
		borderColor: Colors.red,
		color: Colors.red,
	},
	inputFocused: {
		color: Colors.textPrimary,
		borderColor: Colors.textPrimary,
	},
});

export default FormInput;
