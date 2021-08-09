import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ChangeMemberScreen from "./screen/members/ChangeMemberScreen";
import MemberScreen from "./screen/members/MemberScreen";
import MembersScreen from "./screen/members/MembersScreen";

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
