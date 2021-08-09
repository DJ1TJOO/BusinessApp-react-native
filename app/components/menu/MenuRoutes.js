import React from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import { IconArrowForward } from "../Icons";

const MenuRoutes = ({ routes, animatedValue }) => {
	const height = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 35],
		extrapolate: "clamp",
	});
	return (
		<Animated.View style={[styles.routes, { opacity: animatedValue }]}>
			{routes.map((route) => {
				return (
					<TouchableOpacity key={route.title} onPress={route.onPress}>
						<Animated.View style={[styles.route, { height: height }, animatedValue > 0.6 && { padding: animatedValue }]}>
							<Text style={styles.routeTitle}>{route.title}</Text>
							<IconArrowForward color={Colors.white} style={styles.icon} />
						</Animated.View>
					</TouchableOpacity>
				);
			})}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	routes: {},
	route: {
		backgroundColor: Colors.primary,
		borderRadius: 12,
		marginTop: 5,
		width: "100%",
		padding: 5,
		paddingLeft: 10,
		paddingTop: Platform.OS === "android" ? 5 : 2,
	},
	routeTitle: {
		color: Colors.white,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",

		textAlignVertical: "center",
	},
	icon: {
		position: "absolute",
		left: "100%",
		marginLeft: -15,
		top: 8,
		height: 18,
	},
});

export default MenuRoutes;
