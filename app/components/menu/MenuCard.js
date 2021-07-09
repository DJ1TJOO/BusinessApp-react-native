import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, Animated } from "react-native";

import { IconArrowForward } from "../Icons";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import MenuCardIcon from "./MenuCardIcon";
import MenuRoutes from "./MenuRoutes";

const MenuCard = ({ title, onPress, routes, style, color }) => {
	const animatedValue = useRef(new Animated.Value(0)).current;
	const [isOpenend, setIsOpenend] = useState(false);

	let height = 45;
	if (routes) {
		height = animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [45, 50 * (routes.length + 1)],
			extrapolate: "clamp",
		});
	}

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isOpenend ? 1 : 0,
			duration: 500,
			useNativeDriver: false,
		}).start();
	}, [isOpenend]);

	return (
		<TouchableOpacity
			key={title}
			onPress={
				routes
					? () => {
							setIsOpenend(!isOpenend);
					  }
					: onPress
			}
		>
			<Animated.View style={[styles.card, style, { height: height }]}>
				<Text style={[styles.text, color && { color: color }]}>{title}</Text>
				{routes && <MenuCardIcon animatedValue={animatedValue} style={styles.icon} />}
				{!routes && <IconArrowForward color={color || Colors.textPrimary} style={[styles.icon, { top: 12 }]} />}
				{routes && <MenuRoutes routes={routes} animatedValue={animatedValue} />}
			</Animated.View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		width: "100%",
		backgroundColor: Colors.tertiary,
		borderRadius: 12,
		marginBottom: 5,
		padding: 10,
		paddingTop: 35,
	},
	icon: {
		position: "absolute",
		left: "100%",
		marginLeft: -15,
		top: 5,
	},
	text: {
		color: Colors.textPrimary,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",

		position: "absolute",
		left: 10,
		top: 5,
	},
});

export default MenuCard;
