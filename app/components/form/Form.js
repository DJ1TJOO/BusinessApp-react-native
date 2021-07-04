import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "../../config/Colors";

const Form = ({ children, title }) => {
	return (
		<View style={styles.form}>
			<Text style={styles.title}>{title}</Text>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	form: {
		marginHorizontal: 10,
		marginVertical: 5,
	},
	title: {
		color: Colors.textPrimary,
		fontSize: 40,
		fontFamily: "Segoe-UI",
	},
});

export default Form;
