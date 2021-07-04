import React from "react";
import { StyleSheet, ScrollView, Text } from "react-native";

import SafeView from "./SafeView";
import Colors from "../config/Colors";

const Wrapper = ({ children, style, showHeader }) => {
	return (
		<SafeView>
			{showHeader && <Text style={styles.header}>Business App</Text>}
			<ScrollView keyboardDismissMode="interactive" style={[styles.wrapper, style]}>
				{children}
			</ScrollView>
		</SafeView>
	);
};

const styles = StyleSheet.create({
	header: {
		fontSize: 40,
		color: Colors.primary,
		fontFamily: "Segoe-UI",
		marginHorizontal: 10,
	},
	wrapper: {
		flex: 1,
		marginHorizontal: 10,
	},
});

export default Wrapper;
