import React, { useState } from "react";
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedbackBase, View } from "react-native";

import { IconAgenda, IconAgendaSelected } from "../Icons";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const FormDate = ({ label, helpLabel, helpOnPress }) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isFocused, setIsFocused] = useState(false);
	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			<TouchableOpacity onPress={() => setIsFocused(!isFocused)} style={isFocused ? [styles.currentDateBox, styles.currentDateBoxFocused] : styles.currentDateBox}>
				{isFocused ? <IconAgendaSelected style={styles.icon} /> : <IconAgenda style={styles.icon} />}
				<Text style={isFocused ? [styles.currentDate, styles.currentDateFocused] : styles.currentDate}>{currentDate.toLocaleDateString()}</Text>
				{helpLabel && (
					<TouchableOpacity onPress={helpOnPress}>
						<Text style={styles.helpButtonText}>{helpLabel}</Text>
					</TouchableOpacity>
				)}
			</TouchableOpacity>
			{isFocused && <View style={label ? [styles.dateBox, styles.dateBoxWithLabel] : styles.dateBox}></View>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		zIndex: 3,
	},
	currentDate: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	currentDateFocused: {
		color: Colors.textPrimary,
	},
	currentDateBox: {
		paddingTop: 2,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: Colors.tertiary,
		height: 38,
		paddingHorizontal: 10,
	},
	currentDateBoxFocused: {
		borderColor: Colors.textPrimary,
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
	},
	dateBox: {
		position: "absolute",
		top: 36,
		height: 140,
		width: "100%",
		borderBottomRightRadius: 12,
		borderBottomLeftRadius: 12,
		borderWidth: 2,
		borderColor: Colors.textPrimary,
		backgroundColor: Colors.white,
	},
	dateBoxWithLabel: {
		top: 63,
	},
	helpButtonText: {
		color: Colors.primary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	icon: {
		position: "absolute",
		top: 3,
		left: "100%",
		marginLeft: -11,
		width: 28,
		height: 28,
	},
	label: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
});

export default FormDate;
