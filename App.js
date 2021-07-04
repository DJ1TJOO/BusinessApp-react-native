import React from "react";
import AppLoading from "expo-app-loading";
import { useFonts } from "@use-expo/font";
import { NavigationContainer } from "@react-navigation/native";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";

import WelcomeScreen from "./app/screen/WelcomeScreen";
import LoginScreen from "./app/screen/LoginScreen";
import { StatusBar } from "react-native";
import Colors from "./app/config/Colors";

const Stack = createStackNavigator();

export default function App() {
	let [fontsLoaded] = useFonts({
		"Segoe-UI": require("./app/assets/fonts/Segoe-UI.ttf"),
	});

	StatusBar.setBarStyle("dark-content");

	if (!fontsLoaded) {
		return <AppLoading />;
	} else {
		return (
			<NavigationContainer>
				<Stack.Navigator mode="modal" headerMode="none">
					<Stack.Screen name="Welcome" component={WelcomeScreen} />
					<Stack.Screen name="Login" component={LoginScreen} />
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}
