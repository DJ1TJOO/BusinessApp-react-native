import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Menu from "./Menu";
import HomeScreen from "./screen/HomeScreen";
import Hours from "./Hours";

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
		</Drawer.Navigator>
	);
};

export default Account;
