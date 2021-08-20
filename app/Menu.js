import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView, useIsDrawerOpen } from "@react-navigation/drawer";
import React, { useContext, useEffect } from "react";
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { IconArrowBack } from "./components/Icons";
import MenuCard from "./components/menu/MenuCard";

import Colors from "./config/Colors";
import { config } from "./config/config";
import FontSizes from "./config/FontSizes";

import dataContext from "./contexts/dataContext";
import lastStatusBarColorContext from "./contexts/lastStatusBarColorContext";

const Menu = ({ navigation }) => {
	const [data, setData] = useContext(dataContext);
	const [lastStatusBarColor, setLastStatusBarColor] = useContext(lastStatusBarColorContext);

	if (Platform.OS === "android") {
		const isOpen = useIsDrawerOpen();
		useEffect(() => {
			if (isOpen) {
				StatusBar.setBackgroundColor(styles.container.backgroundColor, true);
			} else if (lastStatusBarColor) {
				StatusBar.setBackgroundColor(lastStatusBarColor, true);
			}
		}, [isOpen]);
	}

	return (
		<DrawerContentScrollView style={[styles.container, { width: useWindowDimensions().width }]}>
			<TouchableOpacity
				style={styles.header}
				onPress={() => {
					navigation.closeDrawer();
				}}
			>
				<Image source={{ uri: config.api + "images/business_logos/" + data.business.logo }} resizeMode="cover" style={[styles.logo]} />
				<View style={styles.info}>
					{data.user && (
						<Text style={styles.name}>
							{data.user.firstName} {data.user.lastName}
						</Text>
					)}
					{data.user && data.user.function && <Text style={styles.function}>{data.user.function}</Text>}
				</View>
				<IconArrowBack style={styles.back} />
			</TouchableOpacity>
			// TODO: check for rights
			<MenuCard
				title="Start"
				onPress={() => {
					navigation.navigate("Home");
				}}
			/>
			<MenuCard
				title="Uren"
				routes={[
					{
						title: "Mijn uren",
						onPress: () => {
							navigation.navigate("Hours");
						},
					},
					{
						title: "Uren controleren",
						onPress: () => {
							navigation.navigate("CheckHours");
						},
					},
				]}
			/>
			<MenuCard
				title="Berichten"
				onPress={() => {
					navigation.navigate("Chats");
				}}
			/>
			<MenuCard
				title="Gebruikers"
				routes={[
					{
						title: "Alle gebruikers",
						onPress: () => {
							navigation.navigate("Members");
						},
					},
					{
						title: "Gebruiker toevoegen",
						onPress: () => {
							navigation.navigate("CreateMember");
						},
					},
					{
						title: "Alle rechten",
						onPress: () => {
							navigation.navigate("Rights");
						},
					},
					{
						title: "Recht toevoegen",
						onPress: () => {
							navigation.navigate("CreateRight");
						},
					},
				]}
			/>
			<MenuCard
				title="Instellingen"
				onPress={() => {
					navigation.navigate("Settings");
				}}
			/>
			<MenuCard
				title="Logout"
				style={{ backgroundColor: Colors.red }}
				color={Colors.white}
				onPress={async () => {
					setData({ ...data, token: null, user: null });

					// Token invalid reset storage
					await AsyncStorage.removeItem("token");

					navigation.navigate("Login");
				}}
			/>
			<View style={{ height: 50, width: "100%", backgroundColor: Colors.secondary }} />
		</DrawerContentScrollView>
	);
};

const styles = StyleSheet.create({
	back: {
		position: "absolute",
		left: "100%",
		marginLeft: Platform.OS === "web" ? -30 : -10,
	},
	container: {
		backgroundColor: Colors.secondary,
		padding: 10,
	},
	header: {
		backgroundColor: Colors.primary,
		width: "100%",
		height: 120,
		borderRadius: 12,
		padding: 10,
		flexDirection: "row",
		marginBottom: 5,
	},
	logo: {
		height: 100,
		width: 100,
		borderRadius: 60,
	},
	info: {
		justifyContent: "center",
		left: 10,
	},
	name: {
		color: Colors.white,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
	},
	function: {
		color: Colors.white,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
});

export default Menu;
