import React, { cloneElement, isValidElement, useEffect } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View, Animated } from "react-native";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

import { IconArrowBack } from "./Icons";

const Heading = ({ title, style, containerStyle, icon, onPress, animatedValue }) => {
	const Container = typeof animatedValue !== "undefined" ? Animated.View : View;
	const TextContainer = typeof animatedValue !== "undefined" ? Animated.Text : Text;

	let colorWhiteToPrimary;
	let colorTextPrimaryToWhite;
	if (typeof animatedValue !== "undefined") {
		colorWhiteToPrimary = animatedValue.interpolate({
			inputRange: [5, 50],
			outputRange: [Colors.white, Colors.primary],
			extrapolate: "clamp",
		});

		colorTextPrimaryToWhite = animatedValue.interpolate({
			inputRange: [5, 50],
			outputRange: [Colors.textPrimary, Colors.white],
			extrapolate: "clamp",
		});

		// Change icon colors
		if (icon) {
			if (isValidElement(icon)) {
				icon = cloneElement(icon, {
					animated: true,
					color: colorTextPrimaryToWhite,
				});
			}
		}
	}

	return (
		<TouchableWithoutFeedback onPress={onPress}>
			<Container
				style={[
					styles.container,
					containerStyle,
					animatedValue && { paddingBottom: 5 },
					colorWhiteToPrimary && {
						backgroundColor: colorWhiteToPrimary,
					},
				]}
			>
				{icon && icon}
				<TextContainer
					style={[
						styles.heading,
						style,
						colorTextPrimaryToWhite && {
							color: colorTextPrimaryToWhite,
						},
					]}
				>
					{title}
				</TextContainer>
			</Container>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	backIcon: {
		marginRight: 10,
		marginTop: 2,
	},
	container: {
		flexDirection: "row",
		alignContent: "center",
	},
	heading: {
		color: Colors.textPrimary,
		fontSize: FontSizes.heading,
		fontFamily: "Segoe-UI",
		marginBottom: 1,
	},
});

Heading.BACK_ICON = <IconArrowBack color={Colors.textPrimary} style={styles.backIcon} />;

export default Heading;
