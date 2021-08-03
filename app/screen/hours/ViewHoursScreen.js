import React, { useState, useContext } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

import Heading from "../../components/Heading";
import { IconArrowBack, IconCross } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import FormButton from "../../components/form/FormButton";

import dataContext from "../../contexts/dataContext";

import config from "../../config/config";

const HoursColumn = ({ name, hours, setHours, hoursIndex, canSelect }) => {
	return (
		<View style={styles.column}>
			<Text style={styles.name}>{name}</Text>

			{hours.map((project, index) => (
				<View style={styles.projectView} key={index}>
					<Text style={styles.project}>{project.hours[hoursIndex]}</Text>
				</View>
			))}
			<View
				style={{
					backgroundColor: Colors.primary,
					height: 2,
					width: "100%",
				}}
			/>
			<Text style={styles.totalValue}>{hours.reduce((currentValue, project) => (currentValue += Number(project.hours[hoursIndex])), 0)}</Text>
		</View>
	);
};

const emptyProject = { project: "Project", description: "", hours: ["0", "0", "0", "0", "0", "0", "0"] };

const convertDataToHours = (currentHours) => {
	return currentHours.hours.map((x) => ({
		id: x.id,
		hours_id: x.hours_id,
		project: x.project + (x.projectName ? " - " + x.projectName : ""),
		description: x.description,
		hours: [x.monday.toString(), x.tuesday.toString(), x.wednesday.toString(), x.thursday.toString(), x.friday.toString(), x.saturday.toString(), x.sunday.toString()],
	}));
};

const convertHoursToData = (hours) => {
	return hours
		.filter((x) => x.project !== emptyProject.project || x.description !== emptyProject.description || x.hours !== emptyProject.hours)
		.map((x) => {
			const projectInfo = x.project.split("-");
			const project = projectInfo[0].trim();

			let projectName = null;
			if (projectInfo.length > 1) {
				projectName = projectInfo[projectInfo.length - 1].trim();
			}

			return {
				id: x.id,
				hours_id: x.hours_id,
				project,
				projectName,
				description: x.description,
				monday: Number(x.hours[0]),
				tuesday: Number(x.hours[1]),
				wednesday: Number(x.hours[2]),
				thursday: Number(x.hours[3]),
				friday: Number(x.hours[4]),
				saturday: Number(x.hours[5]),
				sunday: Number(x.hours[6]),
			};
		});
};

const ViewHoursScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);

	const { year, week } = route.params;
	const currentHours = data.hours.find((x) => x.year === year && x.week === week);

	const [hours, setHours] = useState(currentHours ? convertDataToHours(currentHours) : [{ ...emptyProject }]);

	const [canSelect, setCanSelect] = useState(true);

	const offsets = [Dimensions.get("window").width - 20 + 5];
	offsets.push(offsets[0] + (Dimensions.get("window").width - 20) + 5);
	for (let i = 2; i < 9; i++) {
		offsets.push(offsets[i - 1] + 185);
	}

	return (
		<Wrapper showHeader={true} navigation={navigation}>
			<View style={styles.header}>
				<Heading title={`Uren week ${week} (${year})`} />
				{hours.valid === true ? <IconCheck style={styles.icon} /> : hours.valid === false ? <IconCross style={styles.icon} /> : null}
			</View>
			{hours.length > 0 && (
				<ScrollView
					onScrollBeginDrag={() => {
						setCanSelect(false);
					}}
					onScrollEndDrag={() => {
						setCanSelect(true);
					}}
					keyboardShouldPersistTaps="handled"
					nestedScrollEnabled={true}
					horizontal={true}
					style={styles.row}
					decelerationRate={0}
					snapToOffsets={offsets}
				>
					<View style={styles.column}>
						<Text style={styles.name}>Project</Text>
						{hours.map((project, index) => (
							<View key={index} style={[styles.projectView, { width: Dimensions.get("window").width - 20 }]}>
								<Text style={[styles.project]}>{project.project}</Text>
							</View>
						))}
						<View
							style={{
								backgroundColor: Colors.primary,
								height: 2,
								width: "100%",
							}}
						/>
						<Text style={styles.total}>Totaal</Text>
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Omschrijving</Text>
						{hours.map((project, index) => (
							<View key={index} style={[styles.projectView, { width: Dimensions.get("window").width - 20 }]}>
								<Text style={[styles.project]}>{project.description || "-"}</Text>
							</View>
						))}
						<View
							style={{
								backgroundColor: Colors.primary,
								height: 2,
								width: "100%",
							}}
						/>
					</View>
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={0} name="Maandag" canSelect={canSelect} />
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={1} name="Dinsdag" canSelect={canSelect} />
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={2} name="Woensdag" canSelect={canSelect} />
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={3} name="Donderdag" canSelect={canSelect} />
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={4} name="Vrijdag" canSelect={canSelect} />
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={5} name="Zaterdag" canSelect={canSelect} />
					<HoursColumn hours={hours} setHours={setHours} hoursIndex={6} name="Zondag" canSelect={canSelect} />

					<View style={styles.column}>
						<Text style={styles.total}>Totaal</Text>
						{hours.map((project, index) => (
							<View key={index}>
								<View
									style={{
										backgroundColor: Colors.primary,
										height: 38,
										width: 2,
										marginTop: -5,
										marginBottom: 10,
									}}
								>
									<Text style={styles.totalValue}>{project.hours.reduce((currentValue, hours) => (currentValue += Number(hours)), 0)}</Text>
								</View>
							</View>
						))}
						<View
							style={{
								backgroundColor: Colors.primary,
								height: 2,
								width: "100%",
								marginTop: -5,
							}}
						/>
						<Text style={styles.totalValue}>
							{hours.reduce((currentValue, project) => (currentValue += project.hours.reduce((currentValue, hours) => (currentValue += Number(hours)), 0)), 0)}
						</Text>
					</View>
				</ScrollView>
			)}
			<FormButton
				bad={true}
				onPress={async () => {
					try {
						// Submit hours
						const res = await fetch(`${config.api}hours/${currentHours.id}`, {
							method: "PATCH",
							headers: {
								Accept: "application/json",
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								submitted: false,
							}),
						}).then((res) => res.json());
						if (!res.success) {
							//TODO: error message
							console.log(res);
							return;
						}

						// Update hours
						navigation.navigate("Hours", { update: [currentHours.year], date: Date.now() });
					} catch (error) {
						console.log(error);
					}
				}}
			>
				Inleveren ongedaan maken
			</FormButton>
			<FormButton
				onPress={() => {
					navigation.navigate("Hours");
				}}
			>
				<IconArrowBack />
			</FormButton>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
	},
	icon: {
		width: 35,
		height: 35,
		marginLeft: 10,
		marginTop: 2,
	},
	name: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	projectView: {
		marginBottom: 5,
		height: 38,
		justifyContent: "center",
	},
	project: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		left: 12,
	},
	total: {
		color: Colors.primary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",

		marginBottom: 5,
		left: 12,
	},
	totalValue: {
		color: Colors.primary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		left: 12,
		width: 80,
	},
	row: {
		flexDirection: "row",
	},
	column: {
		marginRight: 5,
	},
});

export default ViewHoursScreen;
