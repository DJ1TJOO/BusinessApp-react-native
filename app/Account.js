import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";

import Chats from "./Chats";
import CheckHours from "./CheckHours";
import Hours from "./Hours";
import Members from "./Members";
import Menu from "./Menu";
import Rights from "./Rights";

import HomeScreen from "./screen/HomeScreen";
import SettingsScreen from "./screen/SettingsScreen";

import CreateMemberScreen from "./screen/members/CreateMemberScreen";
import CreateRightScreen from "./screen/rights/CreateRightScreen";

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
			<Drawer.Screen name="Settings" component={SettingsScreen} />

			<Drawer.Screen name="Hours" component={Hours} />
			<Drawer.Screen name="CheckHours" component={CheckHours} />

			<Drawer.Screen name="Chats" component={Chats} />

			<Drawer.Screen name="Members" component={Members} />
			<Drawer.Screen name="CreateMember" component={CreateMemberScreen} />

			<Drawer.Screen name="Rights" component={Rights} />
			<Drawer.Screen name="CreateRight" component={CreateRightScreen} />
		</Drawer.Navigator>
	);
};

export default Account;
