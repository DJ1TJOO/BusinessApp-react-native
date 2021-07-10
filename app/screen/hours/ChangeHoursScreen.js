import React, { useState, useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";

import Heading from "../../components/Heading";
import { IconAdd, IconCross, IconDown, IconRemove, IconArrowBack } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import FormInput from "../../components/form/FormInput";
import FormButton from "../../components/form/FormButton";

const ChangeHoursScreen = ({ navigation }) => {
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

	const [hours, setHours] = useState([{ project: "Pauze", description: "d", hours: ["0.513", "0", "0", "0", "0", "0", "0"] }]);
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
				<Heading title="Uren week 9" />
				<IconCross style={styles.icon} />
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
							let ref;
							return (
								<View key={index}>
									<FormInput
										editable={canSelect}
										innerRef={(input) => {
											ref = input;
										}}
										value={project.project}
										style={[styles.project, { width: Dimensions.get("window").width - 20 }]}
										innerStyle={[index === currentProjectSelector && styles.projectSelected]}
										onChange={(text) => {
											hours[index].project = text;
											setHours([...hours]);
										}}
									>
										<TouchableOpacity
											style={styles.projectIconTouch}
											onPress={() => {
												if (!canSelect) return;
												if (currentProjectSelector === index) {
													setCurrentProjectSelector(-1);
												} else {
													setCurrentProjectSelector(index);
												}
											}}
										>
											<View style={styles.projectIcon}>
												<IconDown style={styles.projectIconDown} />
											</View>
										</TouchableOpacity>
										{currentProjectSelector === index && (
											<TouchableOpacity
												onPress={() => {
													setCurrentProjectSelector(index);
												}}
											>
												<FlatList
													style={styles.projectSelector}
													data={projects}
													keyExtractor={(project, index) => index.toString()}
													renderItem={({ item, index: projectIndex }) => (
														<TouchableOpacity
															key={projectIndex}
															style={styles.projectSelectorProject}
															onPress={() => {
																hours[index].project = item;
																setHours([...hours]);
																setCurrentProjectSelector(-1);
															}}
														>
															<Text style={styles.projectSelectorProjectText}>{item}</Text>
														</TouchableOpacity>
													)}
												></FlatList>
											</TouchableOpacity>
										)}
									</FormInput>
								</View>
							);
						})}
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
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Maandag</Text>

						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[0] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[0] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[0]}
							/>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Dinsdag</Text>
						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[1] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[1] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[1]}
							/>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Woensdag</Text>
						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[2] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[2] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[2]}
							/>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Donderdag</Text>
						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[3] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[3] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[3]}
							/>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Vrijdag</Text>
						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[4] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[4] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[4]}
							/>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Zaterdag</Text>
						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[5] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[5] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[5]}
							/>
						))}
					</View>
					<View style={styles.column}>
						<Text style={styles.name}>Zondag</Text>
						{hours.map((project, index) => (
							<FormInput
								editable={canSelect}
								onChange={(text) => {
									hours[index].hours[6] = text;
									setHours([...hours]);
								}}
								onEndEditing={(e) => {
									hours[index].hours[6] = e.nativeEvent.text || "0";
									setHours([...hours]);
								}}
								keyboardType={"numeric"}
								key={index}
								style={styles.hours}
								value={project.hours[6]}
							/>
						))}
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
	projectIconTouch: {
		height: 38,
		width: 38,

		position: "absolute",
		left: "100%",
		marginLeft: -38,
		borderRadius: 8,

		justifyContent: "center",
		alignContent: "center",
	},
	projectIcon: {
		backgroundColor: Colors.secondary,
		height: 30,
		width: 30,

		borderRadius: 8,

		justifyContent: "center",
		alignContent: "center",

		left: 4,
	},
	projectIconDown: {
		marginTop: -18,
		left: 5,
	},
	projectSelected: {
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
		borderColor: Colors.textPrimary,
		color: Colors.textPrimary,
	},
	projectSelector: {
		borderWidth: 2,
		borderColor: Colors.textPrimary,
		borderBottomRightRadius: 12,
		borderBottomLeftRadius: 12,
		marginTop: -2,
		maxHeight: 196,
	},
	projectSelectorProject: {
		borderBottomColor: Colors.textPrimary,
		borderBottomWidth: 2,
		padding: 10,
	},
	projectSelectorProjectText: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
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
