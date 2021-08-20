import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import api from "../../api";

import Message from "../../components/chat/Message";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import FormInput from "../../components/form/FormInput";

import dataContext from "../../contexts/dataContext";

import utils from "../../utils";
import { IconArrowForward } from "../../components/Icons";
import Colors from "../../config/Colors";
import useFormData from "../../hooks/useFormData";

const defaultFormData = [["message"], [], []];

const ChatScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);

	// TODO: get chat groups
	const getData = async () => {
		if (!data.chatMembers) data.chatMembers = [];
		if (!data.chats) data.chats = [];
		if (!data.chatMessages) data.chatMessages = {};
		try {
			const resMembers = await api.fetchToken("users/business/" + data.user.businessId + "?names=true").then((res) => res.json());
			if (resMembers.success) data.chatMembers = resMembers.data.filter((x) => x.id !== data.user.id);

			const resChats = await api.fetchToken("chats").then((res) => res.json());
			if (resChats.success) data.chats = resChats.data;

			const resChatMessages = await api.fetchToken("chats/messages/" + route.params.id + "/20").then((res) => res.json());
			if (resChatMessages.success) data.chatMessages[route.params.id] = resChatMessages.data;

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
		<Wrapper
			showHeader={true}
			navigation={navigation}
			toBottom={true}
			heading={
				<Heading
					icon={Heading.BACK_ICON}
					title={
						route.params.members.length === 2 && data.chatMembers
							? data.chatMembers.find((x) => route.params.members.includes(x.id))?.firstName +
							  " " +
							  data.chatMembers.find((x) => route.params.members.includes(x.id))?.lastName
							: route.params.name
					}
					onPress={() => {
						navigation.navigate("Chats");
					}}
					containerStyle={styles.heading}
				/>
			}
			error={currentError}
			setError={setCurrentError}
			loading={!data.chats || !data.chatMembers || !data.chatMessages || !data.chatMessages[route.params.id]}
		>
			{data.chatMessages &&
				data.chatMembers &&
				data.chatMessages[route.params.id] &&
				data.chatMessages[route.params.id].map((message) => {
					<Heading title={"Vandaag"} />;

					return (
						<Message
							key={message.message + message.created}
							member={message.userId === data.user.id ? data.user : data.chatMembers.find((x) => x.id === message.userId)}
							name={false}
							message={decodeURIComponent(message.message)}
							date={new Date(message.created)}
						/>
					);
				})}
			<View style={[styles.input]}>
				<FormInput multiline={true} returnKeyType="default" innerStyle={{ height: 100 }} {...getFormProps("message")} />
				<TouchableOpacity
					style={styles.send}
					onPress={async () => {
						const message = formData.message.value.trim();
						if (message.length < 1) {
							return;
						}
						if (message.length > 255) return setCurrentError("Het bericht mag niet langer zijn dan 255 karakters");
						try {
							const res = await api
								.fetchToken("chats/" + route.params.id + "/message", {
									method: "POST",
									json: true,
									body: {
										message,
									},
								})
								.then((res) => res.json());

							if (res.success) {
								data.chatMessages[route.params.id].push(res.data);
								setData({ ...data });
								setFormValue("message")("");
							} else {
								setCurrentError("Kon bericht niet versturen");
							}
						} catch (error) {}
					}}
				>
					<IconArrowForward color={Colors.primary} style={styles.sendIcon} />
				</TouchableOpacity>
			</View>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	heading: { paddingHorizontal: 10 },
	input: {
		width: "100%",
		zIndex: 5,
	},
	sendIcon: {
		top: 9,
		left: 9,
	},
	send: {
		position: "absolute",
		right: 5,
		bottom: 5,
		backgroundColor: Colors.secondary,
		height: 38,
		width: 38,
		borderRadius: 12,
	},
});

export default ChatScreen;
