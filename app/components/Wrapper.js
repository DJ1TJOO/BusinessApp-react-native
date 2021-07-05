import React from "react";
import { StyleSheet, ScrollView, Text, View } from "react-native";

import SafeView from "./SafeView";
import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

const Wrapper = ({ children, style, showHeader }) => {
	return (
		<SafeView>
			{showHeader && (
				<View style={styles.header}>
					<View style={styles.menu}>
						<View style={styles.menuBar}></View>
						<View style={styles.menuBar}></View>
						<View style={styles.menuBar}></View>
					</View>
					<Text style={styles.title}>Business App</Text>
				</View>
			)}
			<ScrollView keyboardDismissMode="interactive" style={[styles.wrapper, style]}>
				{children}
			</ScrollView>
		</SafeView>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		marginHorizontal: 10,
		alignItems: "center",
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
		padding: 10,
		height: 45,
		width: 45,
		borderRadius: 12,
	},
	menuBar: {
		backgroundColor: Colors.primary,
		height: 2,
	},
	wrapper: {
		flex: 1,
		marginHorizontal: 10,
	},
});

export default Wrapper;
