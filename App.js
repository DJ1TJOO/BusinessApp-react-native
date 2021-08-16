import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AppLoading from "expo-app-loading";
import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as Font from "expo-font";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, Dimensions, Platform, StatusBar, StyleSheet, View } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";

import { getState, goBack, isAvailable, navigate, navigationRef } from "./RootNavigation";

import Account from "./app/Account";

import icon from "./app/assets/icon-without-circles.png";

import { IconLoading } from "./app/components/Icons";

import Colors from "./app/config/Colors";

import dataContext from "./app/contexts/dataContext";
import lastStatusBarColorContext from "./app/contexts/lastStatusBarColorContext";

import dutch from "./app/languages/dutch";

import LoginScreen from "./app/screen/LoginScreen";
import NoConnectionScreen from "./app/screen/NoConnectionScreen";

import ChangePasswordScreen from "./app/screen/passwords/ChangePasswordScreen";
import ForgotPasswordScreen from "./app/screen/passwords/ForgotPasswordScreen";
import VerifyCodeScreen from "./app/screen/passwords/VerifyCodeScreen";

import RegisterScreen from "./app/screen/RegisterScreen";
import WelcomeScreen from "./app/screen/WelcomeScreen";

import config from "./app/config/config";

import utils from "./app/utils";

const prefix = Linking.makeUrl("/");

const Stack = createStackNavigator();

// TODO: destink between pop up errors and form errors
export default function App() {
	const [data, setData] = useState({
		language: dutch,
	});
	const [linkData, setLinkData] = useState(null);
	const [lastStatusBarColor, setLastStatusBarColor] = useState(Colors.primary);

	const linking = {
		prefixes: [prefix],
		config: {
			screens: {
				Welcome: "welcome",
				Login: "login",
				Register: "register",
				ForgotPassword: {
					path: "forgotpassword/:isCreating?/:businessId/:userId?/:code?",
					parse: {
						isCreating: (string) => string === "true",
						businessId: (string) => string,
						userId: (string) => string,
						code: (string) => string,
					},
					stringify: {
						isCreating: (bool) => bool.toString(),
						businessId: (string) => string,
						userId: (string) => string,
						code: (string) => string,
					},
				},
				Account: "account",
			},
		},
	};

	const handleDeepLink = (e) => {
		setLinkData(Linking.parse(e.url));
	};

	useEffect(() => {
		const getInitialURL = async () => {
			const initialUrl = await Linking.getInitialURL();
			if (initialUrl) setLinkData(Linking.parse(initialUrl));
		};

		Linking.addEventListener("url", handleDeepLink);
		if (!linkData) {
			getInitialURL();
		}

		return () => {
			Linking.removeEventListener("url");
		};
	}, []);

	if (Platform.OS === "android") {
		StatusBar.setBackgroundColor(lastStatusBarColor);
	}
	StatusBar.setBarStyle("dark-content");

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(async (state) => {
			if (!isAvailable()) return;

			if (!state.isConnected) {
				navigate("NoConnection", { servers: false });
			} else {
				try {
					const res = await utils.fetchWithTimeout(config.api).then((res) => res.json());
					if (res.success) {
						const routeState = getState();
						const currentRoute = routeState.routes[routeState.index];
						if (currentRoute.name === "NoConnection") goBack();
					} else {
						navigate("NoConnection", { servers: true });
					}
				} catch (error) {
					navigate("NoConnection", { servers: true });
				}
			}
		});
		return unsubscribe;
	}, []);

	return (
		<AnimatedAppLoader image={icon}>
			<RootSiblingParent>
				<dataContext.Provider value={[data, setData]}>
					<lastStatusBarColorContext.Provider value={[lastStatusBarColor, setLastStatusBarColor]}>
						<NavigationContainer linking={linking} ref={navigationRef}>
							<Stack.Navigator mode="modal" headerMode="none">
								<Stack.Screen name="Welcome" component={WelcomeScreen} />
								<Stack.Screen name="NoConnection" component={NoConnectionScreen} options={{ gestureEnabled: false }} />
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
					</lastStatusBarColorContext.Provider>
				</dataContext.Provider>
			</RootSiblingParent>
		</AnimatedAppLoader>
	);
}

function AnimatedAppLoader({ children, image }) {
	const [isSplashReady, setSplashReady] = useState(false);

	const startAsync = useMemo(
		// If you use a local image with require(...), use `Asset.fromModule`
		() => () => Asset.fromModule(image).downloadAsync(),
		[image]
	);

	const onFinish = useMemo(() => setSplashReady(true), []);

	if (!isSplashReady) {
		return (
			<AppLoading
				// Instruct SplashScreen not to hide yet, we want to do this manually
				autoHideSplash={false}
				startAsync={startAsync}
				onError={console.error}
				onFinish={onFinish}
			/>
		);
	}

	return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children, image }) {
	const animation = useMemo(() => new Animated.Value(1), []);
	const [isAppReady, setAppReady] = useState(false);
	const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

	useEffect(() => {
		if (isAppReady) {
			Animated.timing(animation, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start(() => setAnimationComplete(true));
		}
	}, [isAppReady]);

	const onImageLoaded = async () => {
		try {
			await SplashScreen.hideAsync();

			// Load stuff
			await Promise.all([
				// only android needs polyfill
				Platform.OS === "android" &&
					new Promise((res) => {
						require("intl"); // import intl object
						require("intl/locale-data/jsonp/en-IN"); // load the required locale details
						res();
					}),
				Font.loadAsync({
					"Segoe-UI": require("./app/assets/fonts/Segoe-UI.ttf"),
				}),
			]);
		} catch (e) {
			// handle errors
		} finally {
			setAppReady(true);
		}
	};

	return (
		<View style={{ flex: 1 }}>
			{isAppReady && children}
			{!isSplashAnimationComplete && (
				<Animated.View
					pointerEvents="none"
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: Constants.manifest.splash.backgroundColor,
							opacity: animation,
						},
					]}
				>
					<IconLoading
						animated={true}
						style={{
							position: "absolute",
							top: (Dimensions.get("window").height / 2778) * 560,
							left: (Dimensions.get("window").width / 1284) * 335,
							width: (Dimensions.get("window").width / 1284) * 646,
							height: (Dimensions.get("window").height / 2778) * 646,
							transform: [
								{
									scale: animation,
								},
							],
						}}
					/>
					<Animated.Image
						style={{
							position: "absolute",
							top: (Dimensions.get("window").height / 2778) * 560,
							left: (Dimensions.get("window").width / 1284) * 335,
							width: (Dimensions.get("window").width / 1284) * 646,
							height: (Dimensions.get("window").height / 2778) * 646,
							resizeMode: Constants.manifest.splash.resizeMode || "contain",
							transform: [
								{
									scale: animation,
								},
							],
						}}
						source={image}
						onLoadEnd={onImageLoaded}
						fadeDuration={0}
					/>
				</Animated.View>
			)}
		</View>
	);
}
