import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HoursScreen from "./screen/hours/HoursScreen";
import ChangeHoursScreen from "./screen/hours/ChangeHoursScreen";

const Stack = createStackNavigator();
const Hours = () => {
	return (
		<Stack.Navigator mode="modal" headerMode="none">
			<Stack.Screen name="Hours" component={HoursScreen} />
			<Stack.Screen name="ChangeHours" component={ChangeHoursScreen} />
		</Stack.Navigator>
	);
};

export default Hours;
