import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Heading from "../../components/Heading";
import { IconAdd, IconCross, IconDown, IconRemove, IconArrowBack } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import FormInput from "../../components/form/FormInput";
import FormButton from "../../components/form/FormButton";

const ChangeHoursScreen = ({ navigation }) => {
	const [hours, setHours] = useState([{ project: "Pauze", hours: [0.513, 0, 0, 0, 0, 0, 0] }]);

	return (
		<Wrapper showHeader={true} navigation={navigation}>
			<View style={styles.header}>
				<Heading title="Uren week 9" />
				<IconCross style={styles.icon} />
			</View>
			{hours.length > 0 && (
				<ScrollView horizontal={true} style={styles.row}>
					<View style={styles.column}>
						<Text style={styles.name}>Omschrijving</Text>
						{hours.map((project, index) => (
							<FormInput key={index} value={project.project} style={[styles.project, { width: Dimensions.get("window").width - 20 }]}>
								<TouchableOpacity style={styles.projectIcon}>
									<IconDown style={styles.projectIconDown} />
								</TouchableOpacity>
							</FormInput>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Maandag</Text>

						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[0].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Dinsdag</Text>
						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[1].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Woensdag</Text>
						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[2].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Donderdag</Text>
						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[3].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Vrijdag</Text>
						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[4].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Zaterdag</Text>
						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[5].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Zondag</Text>
						{hours.map((project, index) => (
							<FormInput key={index} style={styles.hours} value={project.hours[6].toFixed(2)} />
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}> </Text>
						{hours.map((project, index) => (
							<TouchableOpacity
								key={index}
								style={styles.remove}
								onPress={() => {
									hours.splice(index, 1);
									setHours([...hours]);
								}}
							>
								<IconRemove style={styles.removeIcon} />
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			)}
			<TouchableOpacity
				style={styles.add}
				onPress={() => {
					hours.push({
						project: "Project",
						hours: [0, 0, 0, 0, 0, 0, 0],
					});
					setHours([...hours]);
				}}
			>
				<IconAdd style={styles.addIcon} />
			</TouchableOpacity>
			<FormButton>Aanpassen</FormButton>
			<FormButton>Inleveren</FormButton>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	add: {
		backgroundColor: Colors.secondary,
		height: 38,
		width: 38,
		borderRadius: 12,
	},
	addIcon: {
		top: 9,
		left: 9,
	},
	back: {
		marginRight: 5,
		marginTop: 2,
	},
	header: {
		flexDirection: "row",
	},
	icon: {
		width: 35,
		height: 35,
		marginLeft: 10,
		marginTop: 2,
	},
	hours: {
		width: 180,
		marginBottom: 5,
	},
	name: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	project: {
		marginBottom: 5,
	},
	projectIcon: {
		backgroundColor: Colors.secondary,
		height: 30,
		width: 30,

		position: "absolute",
		left: "100%",
		marginLeft: -34,
		top: 4,
		borderRadius: 8,

		justifyContent: "center",
		alignContent: "center",
	},
	projectIconDown: {
		marginTop: -18,
		left: 5,
	},
	remove: {
		backgroundColor: Colors.secondary,
		height: 38,
		width: 38,
		borderRadius: 12,

		justifyContent: "center",
		alignContent: "center",
		marginBottom: 5,
	},
	removeIcon: {
		top: 19,
		left: 9,
	},
	row: {
		flexDirection: "row",
	},
	column: {
		marginRight: 5,
	},
});

export default ChangeHoursScreen;
