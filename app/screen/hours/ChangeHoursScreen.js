import React, { useState, useContext } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";

import Heading from "../../components/Heading";
import { IconAdd, IconCross, IconDown, IconRemove, IconArrowBack, IconCheck } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import FormInput from "../../components/form/FormInput";
import FormButton from "../../components/form/FormButton";
import FormSelect from "../../components/form/FormSelect";

import dataContext from "../../contexts/dataContext";

const HoursColumn = ({ name, hours, setHours, hoursIndex, canSelect }) => {
	return (
		<View style={styles.column}>
			<Text style={styles.name}>{name}</Text>

			{hours.map((project, index) => (
				<FormInput
					editable={canSelect}
					onChange={(text) => {
						let currentText = text || "0";
						currentText = currentText.replace(/,/g, ".");
						currentText = currentText.replace(/^([^.]*\.)(.*)$/, function (a, b, c) {
							return b + c.replace(/\./g, "");
						});
						hours[index].hours[hoursIndex] = currentText;
						setHours([...hours]);
					}}
					onEndEditing={(e) => {
						try {
							let currentText = e.nativeEvent.text || "0";
							currentText = currentText.replace(/,/g, ".");
							currentText = currentText.replace(/^([^.]*\.)(.*)$/, function (a, b, c) {
								return b + c.replace(/\./g, "");
							});
							hours[index].hours[hoursIndex] = Number(currentText).toString();
							setHours([...hours]);
						} catch (error) {}
					}}
					keyboardType={"numeric"}
					key={index}
					style={styles.hours}
					value={project.hours[hoursIndex]}
				/>
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

const convertDataToHours = (currentHours) => {
	return currentHours.hours.map((x) => ({
		id: x.id,
		project: x.project + (x.project_id ? " - " + x.project_id : ""),
		description: x.description,
		hours: [x.monday.toString(), x.tuesday.toString(), x.wednesday.toString(), x.thursday.toString(), x.friday.toString(), x.saturday.toString(), x.sunday.toString()],
	}));
};

const ChangeHoursScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);

	const projects = [
		"Huizen - 113133",
		"Maarsen - 123431",
		"Amsterdam - 534654",
		"Rotterdam - 976354",
		"Den Haag - 145263",
		"Groningen - 235175",
		"Amsterdam - 3637474",
		"Rotterdam - 2636575",
	];

	const { year, week } = route.params;
	const currentHours = data.hours.find((x) => x.year === year && x.week === week);

	const [hours, setHours] = useState(currentHours ? convertDataToHours(currentHours) : [{ project: "Project", description: "", hours: ["0", "0", "0", "0", "0", "0", "0"] }]);
	const [currentProjectSelector, setCurrentProjectSelector] = useState(-1);
	const [canSelect, setCanSelect] = useState(true);

	const offsets = [Dimensions.get("window").width - 20 + 5];
	offsets.push(offsets[0] + (Dimensions.get("window").width - 20) + 5);
	for (let i = 2; i < 9; i++) {
		offsets.push(offsets[i - 1] + 185);
	}

	return (
		<Wrapper showHeader={true} navigation={navigation}>
			<View style={styles.header}>
				<Heading title={`Uren week ${currentHours.week} (${currentHours.year})`} />
				{hours.valid === true ? <IconCheck style={styles.icon} /> : hours.valid === false ? <IconCross style={styles.icon} /> : null}
			</View>
			{hours.length > 0 && (
				<ScrollView
					onScrollBeginDrag={() => {
						setCurrentProjectSelector(-1);
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
						{hours.map((project, index) => {
							return (
								<View key={index}>
									<FormSelect
										allowsCustomValue={true}
										editable={canSelect}
										style={[styles.project, { width: Dimensions.get("window").width - 20 }]}
										data={projects}
										value={project.project}
										onChange={(text) => {
											hours[index].project = text;
											setHours([...hours]);
										}}
										selected={currentProjectSelector === index}
										onSelected={(selected) => {
											if (selected) setCurrentProjectSelector(index);
											else setCurrentProjectSelector(-1);
										}}
									/>
								</View>
							);
						})}
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
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].description = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].description = e.nativeEvent.text || "";
									setHours([...hours]);
								}}
								key={index}
								style={[styles.project, { width: Dimensions.get("window").width - 20 }]}
								value={project.description}
							/>
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
					<View style={styles.column}>
						<Text style={styles.name}> </Text>
						{hours.map((project, index) => (
							<TouchableOpacity
								key={index}
								style={styles.remove}
								onPress={() => {
									if (!canSelect) return;
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
						description: "",
						hours: ["0", "0", "0", "0", "0", "0", "0"],
					});
					setHours([...hours]);
				}}
			>
				<IconAdd style={styles.addIcon} />
			</TouchableOpacity>
			<FormButton
				invert={true}
				onPress={() => {
					//TODO: save
					navigation.navigate("Hours");
				}}
			>
				Aanpassen
			</FormButton>
			<FormButton
				onPress={() => {
					//TODO: save and submit
					navigation.navigate("Hours");
				}}
			>
				Inleveren
			</FormButton>
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
	total: {
		color: Colors.primary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",

		marginBottom: 5,
	},
	totalValue: {
		color: Colors.primary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		left: 12,
		width: 80,
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
