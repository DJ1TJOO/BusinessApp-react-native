import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Card from "../../components/Card";
import Wrapper from "../../components/Wrapper";
import Heading from "../../components/Heading";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";
import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

const MembersScreen = ({ navigation }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();

	useEffect(() => {
		// Get users
		if (!data.members) data.members = [];
		(async () => {
			try {
				const res = await fetch(config.api + "users/business/" + data.user.businessId).then((res) => res.json());
				if (res.success) data.members = res.data;
				setData({ ...data });
			} catch (error) {
				throw error;
			}
		})();
	}, []);

	return (
		<Wrapper showHeader={true} navigation={navigation} error={currentError}>
			<Heading title="Alle leden" />
			{data.members &&
				data.members
					.map((member) => ({
						firstname: member.first_name,
						lastname: member.last_name,
						born: new Date(member.born).getTime(),
						function: member.function_descr,
						//TODO: add teams
						teams: [],
						email: member.email,
						//TODO: get rights
						rights: member.right_id,
					}))
					.map((member, index) => (
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
								<Text style={styles.born}> {new Date(member.born).toLocaleDateString()}</Text>
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
