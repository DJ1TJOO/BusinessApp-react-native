import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import api from "../../api";

import Card from "../../components/Card";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

import utils from "../../utils";

const MembersScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);

	const getUsers = async () => {
		if (!data.members) data.members = [];
		try {
			const res = await api.fetchToken("users/business/" + data.user.businessId).then((res) => res.json());
			if (res.success) data.members = res.data;
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	useEffect(() => {
		// Get users
		getUsers();
	}, [route]);

	return (
		<Wrapper showHeader={true} navigation={navigation} refresh={getUsers} loading={!data.members}>
			<Heading title="Alle gebruikers" />
			{data.members &&
				data.members.length > 0 &&
				data.members
					.map((member) => ({
						firstname: member.firstName,
						lastname: member.lastName,
						born: new Date(member.born).getTime(),
						function: member.functionDescr,
						//TODO: add teams
						teams: [],
						email: member.email,
						rights: member.rightId,
						id: member.id,
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
			{data.members && data.members.length < 1 && <Text style={styles.info}>Geen gebruikers</Text>}
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
