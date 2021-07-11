import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Card from "../../components/Card";
import Wrapper from "../../components/Wrapper";
import Heading from "../../components/Heading";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const MembersScreen = ({ navigation }) => {
	const [members, setMembers] = useState([
		{
			firstname: "Full",
			lastname: "Name",
			born: new Date(1980, 11, 11).getTime(),
			function: "Eigenaar",
			teams: ["team", "team2", "team3"],
			email: "fullname@test.test",
			rights: null,
		},
		{
			firstname: "Full",
			lastname: "Name2",
			born: new Date(1980, 11, 2).getTime(),
			function: "",
			teams: [],
			email: "fullname2@test.test",
			rights: "right",
		},
	]);

	return (
		<Wrapper showHeader={true} navigation={navigation}>
			<Heading title="Alle leden" />
			{members.map((member, index) => (
				<Card
					key={index}
					onPress={() => {
						navigation.navigate("Member", member);
					}}
				>
					<View style={styles.row}>
						<Text style={styles.name}>
							{member.firstname} {member.lastname}
						</Text>
						<Text style={styles.born}> - {new Date(member.born).toLocaleDateString()}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.info}>Functie: </Text>
						<Text style={styles.function}>{member.function || "Geen functie"}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.info}>Team(s): </Text>
						<Text style={styles.teams}>
							{member.teams.length < 1
								? "Geen team"
								: (() => {
										const teams = member.teams.join(", ").replace(/.+(,.+)$/g, (a, b) => {
											const string = b.replace(/,/g, "en");
											return a.replace(b, " ") + string;
										});
										return teams;
								  })()}
						</Text>
					</View>
				</Card>
			))}
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	born: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",

		textAlignVertical: "center",
		height: 26,
		alignSelf: "center",
	},
	function: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	info: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	name: {
		color: Colors.textPrimary,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
	},
	row: {
		flexDirection: "row",
	},
	teams: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
});
export default MembersScreen;
