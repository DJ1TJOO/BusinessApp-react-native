import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AppLoading from "expo-app-loading";
import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as Font from "expo-font";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Platform, StatusBar, StyleSheet, View } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";

import Account from "./app/Account";

import icon from "./app/assets/icon-without-circles.png";

import { IconLoading } from "./app/components/Icons";

import Colors from "./app/config/Colors";
import { config, setApi } from "./app/config/config";
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

import utils from "./app/utils";

import { getState, goBack, isAvailable, navigate, navigationRef } from "./RootNavigation";

const prefix = Linking.makeUrl("/");

const Stack = createStackNavigator();

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
					const res = await utils.fetchToken(config.api).then((res) => res.json());
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

	const notificationListener = useRef();
	const responseListener = useRef();

	useEffect(() => {
		notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
			console.log("NOTIFICATION");
			console.log(notification);
			// TODO: handle routes, badges and data
		});

		responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
			console.log("RESPONSE");
			console.log(response);
			// TODO: handle routes, badges and data
		});

		return () => {
			Notifications.removeNotificationSubscription(notificationListener.current);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	return (
		<dataContext.Provider value={[data, setData]}>
			<AnimatedAppLoader image={icon}>
				<RootSiblingParent>
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
				</RootSiblingParent>
			</AnimatedAppLoader>
		</dataContext.Provider>
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

	const [data, setData] = useContext(dataContext);

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
				new Promise((res) => {
					if (Platform.OS !== "android") return res();
					require("intl"); // import intl object
					require("intl/locale-data/jsonp/en-IN"); // load the required locale details
					res();
				}),
				Font.loadAsync({
					"Segoe-UI": require("./app/assets/fonts/Segoe-UI.ttf"),
				}),
				new Promise(async (res) => {
					if (Platform.OS === "web") return res();
					if (Constants.isDevice) {
						const { status: existingStatus } = await Notifications.getPermissionsAsync();
						let finalStatus = existingStatus;
						if (existingStatus !== "granted") {
							const { status } = await Notifications.requestPermissionsAsync();
							finalStatus = status;
						}
						if (finalStatus !== "granted") {
							data.notificationToken = null;
						} else {
							data.notificationToken = (await Notifications.getExpoPushTokenAsync()).data;
						}
					} else {
						data.notificationToken = null;
						alert("Must use physical device for Push Notifications");
					}
					setData(data);

					if (Platform.OS === "android") {
						Notifications.setNotificationChannelAsync("default", {
							name: "default",
							importance: Notifications.AndroidImportance.MAX,
							vibrationPattern: [0, 250, 250, 250],
							lightColor: "#FF231F7C",
						});
					}

					res();
				}),

				new Promise((res) => {
					if (Platform.OS !== "web") return res();

					const style = document.createElement("style");
					style.textContent = `textarea,
						select,
						input,
						button {
							outline: none !important;
						}
						`;
					console.log(style);
					document.head.append(style);
					res();
				}),
				// TODO: remove on prod
				new Promise(async (resolve) => {
					const res = await Promise.race([
						new Promise(async (resolve) => {
							try {
								resolve(await fetch(config.api)).then((res) => res.json());
							} catch (error) {
								resolve(false);
							}
						}),
						new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
					]);
					if (!res) {
						const resForeward = await Promise.race([
							new Promise(async (resolve) => {
								try {
									resolve(await fetch("http://89.32.240.249:8003/v1/").then((res) => res.json()));
								} catch (error) {
									resolve(false);
								}
							}),
							new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
						]);
						if (resForeward && resForeward.success) {
							setApi("http://89.32.240.249:8003/v1/");
						}
					}
					resolve();
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
