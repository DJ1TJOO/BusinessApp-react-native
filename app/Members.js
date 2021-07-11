import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import MembersScreen from "./screen/members/MembersScreen";
import MemberScreen from "./screen/members/MemberScreen";
import ChangeMemberScreen from "./screen/members/ChangeMemberScreen";

const Stack = createStackNavigator();
const Members = () => {
	return (
		<Stack.Navigator mode="modal" headerMode="none">
			<Stack.Screen name="Members" component={MembersScreen} />
			<Stack.Screen name="Member" component={MemberScreen} />
			<Stack.Screen name="ChangeMember" component={ChangeMemberScreen} />
		</Stack.Navigator>
	);
};

export default Members;
