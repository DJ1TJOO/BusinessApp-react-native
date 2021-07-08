import React from "react";
import { StyleSheet, Animated } from "react-native";

import Colors from "../../config/Colors";
import { IconDown } from "../Icons";

const MenuCardIcon = ({ animatedValue, style }) => {
	const spin = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: ["90deg", "0deg"],
		extrapolate: "clamp",
	});
	return (
		<Animated.View style={[style, { transform: [{ translateY: -3 }, { translateY: 10 }, { rotate: spin }, { translateY: -10 }] }]}>
			<IconDown color={Colors.textPrimary} />
		</Animated.View>
	);
};

const styles = StyleSheet.create({});

export default MenuCardIcon;
