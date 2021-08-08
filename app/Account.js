import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "./screen/HomeScreen";

import Menu from "./Menu";
import Hours from "./Hours";
import CheckHours from "./CheckHours";
import Members from "./Members";
import CreateMemberScreen from "./screen/members/CreateMemberScreen";

const Drawer = createDrawerNavigator();
const Account = () => {
	return (
		<Drawer.Navigator
			drawerContent={(props) => <Menu {...props} />}
			drawerStyle={{
				width: "100%",
			}}
			edgeWidth={50}
		>
			<Drawer.Screen name="Home" component={HomeScreen} />

			<Drawer.Screen name="Hours" component={Hours} />
			<Drawer.Screen name="CheckHours" component={CheckHours} />

			<Drawer.Screen name="Members" component={Members} />
			<Drawer.Screen name="CreateMember" component={CreateMemberScreen} />
		</Drawer.Navigator>
	);
};

export default Account;
