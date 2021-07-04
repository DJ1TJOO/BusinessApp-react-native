import React from "react";
import { StatusBar, Platform, StyleSheet, SafeAreaView } from "react-native";

const SafeView = ({ children, style }) => {
	return <SafeAreaView style={[styles.safeView, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
	safeView: {
		top: Platform.OS !== "ios" ? StatusBar.currentHeight : 0,
	},
});

export default SafeView;
