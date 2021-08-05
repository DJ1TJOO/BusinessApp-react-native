import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import React, { useContext } from "react";
import { useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View, Image, TouchableOpacity } from "react-native";

import { IconArrowBack } from "./components/Icons";
import MenuCard from "./components/menu/MenuCard";

import Colors from "./config/Colors";
import config from "./config/config";
import FontSizes from "./config/FontSizes";

import dataContext from "./contexts/dataContext";

const Menu = ({ navigation }) => {
	const [data, setData] = useContext(dataContext);
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
					<Text style={styles.name}>Full Name</Text>
					<Text style={styles.function}>Eigenaar</Text>
				</View>
				<IconArrowBack style={styles.back} />
			</TouchableOpacity>
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
				title="Leden"
				routes={[
					{
						title: "Alle leden",
						onPress: () => {
							navigation.navigate("Members");
						},
					},
					{
						title: "Lid toevoegen",
						onPress: () => {
							navigation.closeDrawer();
						},
					},
					{
						title: "Alle rechten",
						onPress: () => {
							navigation.closeDrawer();
						},
					},
					{
						title: "Recht toevoegen",
						onPress: () => {
							navigation.closeDrawer();
						},
					},
				]}
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
		marginLeft: -10,
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
