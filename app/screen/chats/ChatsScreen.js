import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import api from "../../api";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import Card from "../../components/Card";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

import utils from "../../utils";

const ChatsScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);

	// TODO: get chat groups
	const getUsers = async () => {
		if (!data.chats) data.chats = [];
		try {
			const res = await api.fetchToken("users/business/" + data.user.business_id + "?names=true").then((res) => res.json());
			if (res.success) data.chats = res.data.filter((x) => x.id !== data.user.id);
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
		<Wrapper showHeader={true} navigation={navigation} refresh={getUsers} loading={!data.chats}>
			<Heading title="Alle chats" />
			{data.chats &&
				data.chats.length > 0 &&
				data.chats
					.map((member) => ({
						firstname: member.first_name,
						lastname: member.last_name,
						date: Date.now(),
						text: "Joo hoe gaat het nou. Ik hoorde van blabla blalbla lbl.ab labl alb lllalb lab ll balbal a blalbl la l",
					}))
					.map((member, index) => (
						<Card
							key={index}
							onPress={() => {
								navigation.navigate("Chat", member);
							}}
						>
							<View style={styles.row}>
								<Text style={styles.name}>
									{member.firstname} {member.lastname}
								</Text>
								{member.date && member.text && <Text style={styles.date}> {new Date(member.date).toLocaleDateString()}</Text>}
							</View>

							{member.date && member.text && (
								<Text style={styles.text}>
									{member.text.substring(0, 90)}
									{member.text.length > 90 && "..."}
								</Text>
							)}
						</Card>
					))}
			{data.chats && data.chats.length < 1 && <Text style={styles.info}>Geen chats</Text>}
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	date: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",

		textAlignVertical: "center",
		height: 26,
		alignSelf: "center",
	},
	text: {
		color: Colors.textSecondary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	name: {
		color: Colors.textPrimary,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
});

export default ChatsScreen;
