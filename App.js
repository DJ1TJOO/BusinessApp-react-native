import React from "react";
import AppLoading from "expo-app-loading";
import { useFonts } from "@use-expo/font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";

import WelcomeScreen from "./app/screen/WelcomeScreen";

import LoginScreen from "./app/screen/LoginScreen";
import RegisterScreen from "./app/screen/RegisterScreen";

import ForgotPasswordScreen from "./app/screen/passwords/ForgotPasswordScreen";
import VerifyCodeScreen from "./app/screen/passwords/VerifyCodeScreen";
import ChangePasswordScreen from "./app/screen/passwords/ChangePasswordScreen";

import Account from "./app/Account";

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
					<Stack.Screen name="Register" component={RegisterScreen} />
					<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
					<Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ animationEnabled: false }} />
					<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ animationEnabled: false }} />
					<Stack.Screen
						name="Account"
						component={Account}
						options={{
							gestureEnabled: false,
						}}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
}
