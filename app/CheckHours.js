import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import CheckHoursPersonScreen from "./screen/hours/CheckHoursPersonScreen";
import CheckHoursScreen from "./screen/hours/CheckHoursScreen";
import CheckHoursWeek from "./screen/hours/CheckHoursWeekScreen";

const Stack = createStackNavigator();
const CheckHours = () => {
	return (
		<Stack.Navigator mode="modal" headerMode="none">
			<Stack.Screen name="CheckHours" component={CheckHoursScreen} />
			<Stack.Screen name="CheckHoursPerson" component={CheckHoursPersonScreen} />
			<Stack.Screen name="CheckHoursWeek" component={CheckHoursWeek} />
		</Stack.Navigator>
	);
};

export default CheckHours;
