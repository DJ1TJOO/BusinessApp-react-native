import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import wrapperScrollViewContext from "../../contexts/wrapperScrollViewContext";

import Heading from "../Heading";

const Form = ({ children, title, style, containerStyle, icon, onPress, onLayout, errorLabel, errorOnPress, header = null }) => {
	const [currentErrorLabel, setCurrentErrorLabel] = useState(errorLabel);

	const wrapperScrollView = useContext(wrapperScrollViewContext);

	useEffect(() => {
		wrapperScrollView.current.scrollTo({ x: 0, y: 0, animated: true });
	}, [currentErrorLabel]);

	useEffect(() => {
		if (errorLabel !== currentErrorLabel) setCurrentErrorLabel(errorLabel);
	}, [errorLabel]);

	return (
		<View onLayout={onLayout}>
			{!header && <Heading title={title} style={style} style={containerStyle} icon={icon} onPress={onPress} />}
			{header && header}
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
});

export default Form;
