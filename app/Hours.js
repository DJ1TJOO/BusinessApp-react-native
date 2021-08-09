import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ChangeHoursScreen from "./screen/hours/ChangeHoursScreen";
import HoursScreen from "./screen/hours/HoursScreen";
import ViewHoursScreen from "./screen/hours/ViewHoursScreen";

const Stack = createStackNavigator();
const Hours = () => {
	return (
		<Stack.Navigator mode="modal" headerMode="none">
			<Stack.Screen name="Hours" component={HoursScreen} />
			<Stack.Screen name="ChangeHours" component={ChangeHoursScreen} />
			<Stack.Screen name="ViewHours" component={ViewHoursScreen} />
		</Stack.Navigator>
	);
};

export default Hours;
