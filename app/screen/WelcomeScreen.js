import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import SafeView from "../components/SafeView";
import Colors from "../config/Colors";

const WelcomeScreen = () => {
	return (
		<SafeView style={styles.container}>
			<Text style={styles.header}>Business App</Text>
			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Login</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Register</Text>
			</TouchableOpacity>
		</SafeView>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: Colors.primary,
		padding: 10,
		borderRadius: 6,
		marginTop: 5,
		width: "60%",
		alignItems: "center",
	},
	buttonText: {
		fontSize: 25,
		color: Colors.white,
		fontFamily: "Segoe-UI",
	},
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		top: -80,
	},
	header: {
		fontSize: 40,
		color: Colors.primary,
		fontFamily: "Segoe-UI",
	},
});

export default WelcomeScreen;
