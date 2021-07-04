import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import SafeView from "../components/SafeView";
import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

//TODO: ugly
const WelcomeScreen = ({ navigation }) => {
	return (
		<SafeView style={styles.center}>
			<View style={[styles.center, styles.container]}>
				<Text style={styles.header}>Business App</Text>
				<TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button}>
					<Text style={styles.buttonText}>Register</Text>
				</TouchableOpacity>
			</View>
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
		fontSize: FontSizes.title,
		color: Colors.white,
		fontFamily: "Segoe-UI",
	},
	center: {
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		top: -80,
		width: "100%",
	},
	header: {
		fontSize: FontSizes.heading,
		color: Colors.primary,
		fontFamily: "Segoe-UI",
	},
});

export default WelcomeScreen;
