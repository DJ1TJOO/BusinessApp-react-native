import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ChatScreen from "./screen/chats/ChatScreen";
import ChatsScreen from "./screen/chats/ChatsScreen";

const Stack = createStackNavigator();
const Chats = () => {
	return (
		<Stack.Navigator mode="modal" headerMode="none">
			<Stack.Screen name="Chats" component={ChatsScreen} />
			<Stack.Screen name="Chat" component={ChatScreen} />
		</Stack.Navigator>
	);
};

export default Chats;
