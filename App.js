import React from "react";
import AppLoading from "expo-app-loading";
import { useFonts } from "@use-expo/font";

import WelcomeScreen from "./app/screen/WelcomeScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createStackNavigator();

export default function App() {
	let [fontsLoaded] = useFonts({
		"Segoe-UI": require("./app/assets/fonts/Segoe-UI.ttf"),
	});

	if (!fontsLoaded) {
		return <AppLoading />;
	} else {
		return (
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen
						name="Welcome"
						component={WelcomeScreen}
						options={{
							headerShown: false,
						}}
					/>
					<Stack.Screen name="Hello" component={WelcomeScreen} />
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}
