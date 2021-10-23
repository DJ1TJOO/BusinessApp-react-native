import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import api from "../../api";

import Card from "../../components/Card";
import Heading from "../../components/Heading";
import { IconArrowForward } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const ChatsScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();

	// TODO: get chat groups
	const getData = async () => {
		if (!data.chatMembers) data.chatMembers = [];
		if (!data.chats) data.chats = [];
		try {
			const resMembers = await api.fetchToken("users/business/" + data.user.businessId + "?names=true").then((res) => res.json());
			if (resMembers.success) data.chatMembers = resMembers.data.filter((x) => x.id !== data.user.id);

			const resChats = await api.fetchToken("chats").then((res) => res.json());
			if (resChats.success) data.chats = resChats.data;
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	useEffect(() => {
		// Get users
		getData();
	}, [route]);

	return (
		<Wrapper showHeader={true} navigation={navigation} refresh={getData} loading={!data.chats || !data.chatMembers} error={currentError} setError={setCurrentError}>
			<Heading title="Alle chats" />
			{data.chats &&
				data.chats.length > 0 &&
				data.chats.map((chat, index) => (
					<Card
						key={index}
						onPress={() => {
							navigation.navigate("Chat", chat);
						}}
					>
						<View style={styles.row}>
							<Text style={styles.name}>
								{chat.members.length === 2
									? data.chatMembers.find((x) => chat.members.includes(x.id))?.firstName +
									  " " +
									  data.chatMembers.find((x) => chat.members.includes(x.id))?.lastName
									: chat.name}
							</Text>
							{chat.lastMessage && <Text style={styles.date}>{languagesUtils.capitalizeFirstLetter(utils.formatDate(chat.lastMessage.created, true))}</Text>}
							{!chat.lastMessage && <IconArrowForward color={Colors.textPrimary} style={[styles.icon, { top: 7 }]} />}
						</View>

						{chat.lastMessage && (
							<Text style={styles.text}>
								{decodeURIComponent(chat.lastMessage.message).substring(0, 90)}
								{decodeURIComponent(chat.lastMessage.message).length > 90 && "..."}
							</Text>
						)}
					</Card>
				))}
			{data.chatMembers &&
				data.chats &&
				data.chatMembers
					.filter((x) => !data.chats.find((y) => y.members.length === 2 && y.members.includes(x.id)))
					.map((member, index) => (
						<Card
							key={index}
							onPress={async () => {
								try {
									const res = await api
										.fetchToken("chats", {
											method: "POST",
											json: true,
											body: {
												businessId: data.user.businessId,
												randomName: true,
											},
										})
										.then((res) => res.json());
									if (res.success) {
										const userRes = await api
											.fetchToken("chats/" + res.data.id, {
												method: "POST",
												json: true,
												body: {
													userId: member.id,
												},
											})
											.then((res) => res.json());
										if (userRes.success) {
											await getData();
											navigation.navigate("Chat", userRes.data);
										} else {
											// Display error
											setCurrentError(
												languagesUtils.convertError(
													data.language,
													res,
													{
														userId: member.id,
													},
													"berichten",
													{
														userId: "de gebruiker",
													}
												)
											);
										}
									} else {
										// Display error
										setCurrentError(
											languagesUtils.convertError(
												data.language,
												res,
												{
													businessId: data.user.businessId,
													randomName: true,
												},
												"berichten",
												{
													name: "de naam",
												}
											)
										);
									}
								} catch (error) {
									utils.handleError(error);
								}
							}}
						>
							<View style={styles.row}>
								<Text style={styles.name}>{member.firstName + " " + member.lastName}</Text>
								<IconArrowForward color={Colors.textPrimary} style={[styles.icon, { top: 7 }]} />
							</View>
						</Card>
					))}
			{data.chats && data.chats.length < 1 && data.chatMembers && data.chatMembers.length < 0 && <Text style={styles.info}>Geen chats</Text>}
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
	icon: {
		height: 20,
		top: 0,
	},
});

export default ChatsScreen;
