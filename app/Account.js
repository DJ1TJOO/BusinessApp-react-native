import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "./screen/HomeScreen";
import Menu from "./Menu";

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
			<Drawer.Screen
				name="Home"
				component={HomeScreen}
				options={{
					header: false,
				}}
			/>
		</Drawer.Navigator>
	);
};

export default Account;
