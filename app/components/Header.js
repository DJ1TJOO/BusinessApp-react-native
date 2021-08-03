import React, { useState } from "react";
import { StyleSheet, View, Animated, TouchableOpacity } from "react-native";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

const Header = ({ animatedValue, navigation, scrollView, onLayout }) => {
	const [headerLayout, setHeaderLayout] = useState({ x: 0, y: 0, height: 0, width: 0 });

	const colorWhiteToPrimary = animatedValue.interpolate({
		inputRange: [5, 50],
		outputRange: [Colors.white, Colors.primary],
		extrapolate: "clamp",
	});

	const colorPrimaryToWhite = animatedValue.interpolate({
		inputRange: [5, 50],
		outputRange: [Colors.primary, Colors.white],
		extrapolate: "clamp",
	});

	const colorSecundaryToPrimary = animatedValue.interpolate({
		inputRange: [5, 50],
		outputRange: [Colors.secondary, Colors.primary],
		extrapolate: "clamp",
	});
	const colorSecundaryToWhite = animatedValue.interpolate({
		inputRange: [5, 50],
		outputRange: [Colors.secondary, Colors.white],
		extrapolate: "clamp",
	});
	return (
		<View>
			<Animated.View
				style={{
					position: "absolute",
					height: headerLayout.y + headerLayout.height + 100,
					backgroundColor: colorWhiteToPrimary,
					top: -100,
					left: 0,
					right: 0,
				}}
			></Animated.View>
			<View
				style={styles.header}
				onLayout={(e) => {
					setHeaderLayout(e.nativeEvent.layout);
					if (onLayout) onLayout(e);
				}}
			>
				<TouchableOpacity
					onPress={() => {
						if (navigation) {
							if (navigation.openDrawer) navigation.openDrawer();
							else navigation.goBack();
						}
					}}
				>
					<Animated.View style={[styles.menu, { backgroundColor: colorSecundaryToPrimary, borderColor: colorSecundaryToWhite }]}>
						<Animated.View style={[styles.menuBar, { backgroundColor: colorPrimaryToWhite }]}></Animated.View>
						<Animated.View style={[styles.menuBar, { backgroundColor: colorPrimaryToWhite }]}></Animated.View>
						<Animated.View style={[styles.menuBar, { backgroundColor: colorPrimaryToWhite }]}></Animated.View>
					</Animated.View>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						if (scrollView && scrollView.current) scrollView.current.scrollTo({ x: 0, y: 0, animated: true });
					}}
				>
					<Animated.Text style={[styles.title, { color: colorPrimaryToWhite }]}>Business App</Animated.Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		marginHorizontal: 10,
		alignItems: "center",
		paddingVertical: 10,
	},
	title: {
		fontSize: FontSizes.header,
		color: Colors.primary,
		fontFamily: "Segoe-UI",
		top: -2,
		marginLeft: 5,
	},
	menu: {
		backgroundColor: Colors.secondary,
		justifyContent: "space-evenly",
		padding: 8,
		height: 45,
		width: 45,
		borderRadius: 12,
		borderWidth: 2,
	},
	menuBar: {
		backgroundColor: Colors.primary,
		height: 2,
	},
});

export default Header;
