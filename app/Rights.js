import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import ChangeRightScreen from "./screen/rights/ChangeRightScreen";
import RightScreen from "./screen/rights/RightScreen";
import RightsScreen from "./screen/rights/RightsScreen";

const Stack = createStackNavigator();
const Rights = () => {
	return (
		<Stack.Navigator mode="modal" headerMode="none">
			<Stack.Screen name="Rights" component={RightsScreen} />
			<Stack.Screen name="Right" component={RightScreen} />
			<Stack.Screen name="ChangeRight" component={ChangeRightScreen} />
		</Stack.Navigator>
	);
};

export default Rights;
