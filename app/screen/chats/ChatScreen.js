import React from "react";
import { StyleSheet } from "react-native";

import Message from "../../components/chat/Message";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

const ChatScreen = ({ navigation, route }) => {
	// TODO: get messages
	return (
		<Wrapper
			showHeader={true}
			navigation={navigation}
			heading={
				<Heading
					icon={Heading.BACK_ICON}
					title={route.params?.firstname + " " + route.params?.lastname}
					onPress={() => {
						navigation.navigate("Chats");
					}}
					containerStyle={styles.heading}
				/>
			}
		>
			<Heading title={"Vandaag"} />
			<Message member={route.params} message="Joo hoe gaat het nou. Ik hoorde van blabla blalbla lbl.ab labl alb lllalb lab ll balbal a blalbl la l" date={Date.now()} />
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	heading: { paddingHorizontal: 10 },
});

export default ChatScreen;
