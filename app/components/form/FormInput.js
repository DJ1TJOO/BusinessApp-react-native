import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import { IconCheck, IconCross } from "../Icons";

const FormInput = ({
	label,
	hideText,
	helpLabel,
	helpOnPress,
	errorLabel,
	errorOnPress,
	valid,
	onFocus,
	onBlur,
	onChange,
	validator,
	textContentType,
	keyboardType,
	style,
	children,
	value,
	innerRef,
	innerStyle,
	onPress,
	...otherProps
}) => {
	const [currentErrorLabel, setCurrentErrorLabel] = useState(errorLabel);
	const [isFocused, setIsFocused] = useState(false);
	const [isValid, setIsValid] = useState(valid);
	const [currentValue, setCurrentValue] = useState(value);

	useEffect(() => {
		setCurrentErrorLabel(errorLabel);
	}, [errorLabel]);

	useEffect(() => {
		if (currentValue !== value) checkValue(value);
	}, [value]);

	const checkValue = (text) => {
		setCurrentValue(text);
		const valid = validate(true, text);
		if (onChange) onChange(text, valid);
	};

	const validate = (feedback = false, value = null) => {
		if (validator) {
			const valid = validator(value || currentValue);
			if (valid === true) {
				if (feedback) {
					setCurrentErrorLabel(null);
					setIsValid(true);
				}
				return true;
			} else {
				if (feedback) {
					setCurrentErrorLabel(valid);
					setIsValid(false);
				}
				return false;
			}
		}
		return true;
	};

	const input = (
		<View>
			{isValid === true && <IconCheck style={[styles.iconCheck]} />}
			{isValid === false && <IconCross style={[styles.iconCross]} />}
			<TextInput
				ref={innerRef}
				clearTextOnFocus={false}
				style={[styles.input, isFocused && styles.inputFocused, isValid === true && styles.inputValid, isValid === false && styles.inputInvalid, innerStyle && innerStyle]}
				secureTextEntry={!!hideText}
				onFocus={(e) => {
					setIsFocused(true);
					onFocus && onFocus(e);
				}}
				onBlur={(e) => {
					setIsFocused(false);
					onBlur && onBlur(e);
				}}
				onEndEditing={(e) => {
					if (currentValue) setCurrentValue(currentValue.trim());
				}}
				textContentType={textContentType}
				keyboardType={keyboardType}
				onChangeText={(text) => checkValue(text)}
				value={currentValue}
				returnKeyType="done"
				{...otherProps}
			/>
		</View>
	);

	return (
		<View style={[styles.container, style]}>
			{label && <Text style={styles.label}>{label}</Text>}
			{currentErrorLabel && (
				<TouchableOpacity onPress={errorOnPress}>
					<Text style={styles.errorButtonText}>{currentErrorLabel}</Text>
				</TouchableOpacity>
			)}
			{otherProps.editable === false && <TouchableWithoutFeedback onPress={onPress}>{input}</TouchableWithoutFeedback>}
			{otherProps.editable !== false && input}
			{helpLabel && (
				<TouchableOpacity onPress={helpOnPress}>
					<Text style={styles.helpButtonText}>{helpLabel}</Text>
				</TouchableOpacity>
			)}
			{children}
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
	iconCheck: {
		position: "absolute",
		top: 5,
		left: "100%",
		marginLeft: -35,
		width: 30,
		height: 30,
	},
	iconCross: {
		position: "absolute",
		top: 5,
		left: "100%",
		marginLeft: -28,
		width: 26,
		height: 26,
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
