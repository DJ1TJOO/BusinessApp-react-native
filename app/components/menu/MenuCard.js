import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, Animated, View } from "react-native";

import { IconArrowForward } from "../Icons";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import MenuCardIcon from "./MenuCardIcon";

const MenuCard = ({ title, onPress, routes }) => {
	const animatedValue = useRef(new Animated.Value(0)).current;
	const [isOpenend, setIsOpenend] = useState(false);

	const height = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [45, 50 * (routes.length + 1)],
		extrapolate: "clamp",
	});

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isOpenend ? 0 : 1,
			duration: 500,
			useNativeDriver: false,
		}).start();
	}, [isOpenend]);

	return (
		<TouchableOpacity
			onPress={
				routes
					? () => {
							setIsOpenend(!isOpenend);
					  }
					: onPress
			}
		>
			<Animated.View style={[styles.card, { height: height }]}>
				<Text style={styles.text}>{title}</Text>
				{routes && <MenuCardIcon animatedValue={animatedValue} style={styles.icon} />}
				{!routes && <IconArrowForward color={Colors.textPrimary} style={styles.icon} />}
				{routes && (
					<View style={styles.routes}>
						{routes.map((route) => {
							return (
								<View key={route.title} style={styles.route}>
									<Text style={styles.routeTitle}>{route.title}</Text>
								</View>
							);
						})}
					</View>
				)}
			</Animated.View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		width: "100%",
		backgroundColor: Colors.tertiary,
		borderRadius: 12,
		marginTop: 10,
		padding: 10,
		paddingTop: 35,
	},
	icon: {
		position: "absolute",
		left: "100%",
		marginLeft: -30,
		top: 5,
	},
	routes: {},
	//TODO: fix
	route: {
		backgroundColor: Colors.primary,
		borderRadius: 12,
		marginTop: 10,
		width: "100%",
		padding: 5,
		paddingLeft: 10,
		paddingTop: 2,
	},
	routeTitle: {
		color: Colors.white,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
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
