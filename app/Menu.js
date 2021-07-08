import { DrawerContentScrollView } from "@react-navigation/drawer";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View, Image, TouchableOpacity } from "react-native";

import { IconArrowBack } from "./components/Icons";
import MenuCard from "./components/menu/MenuCard";

import Colors from "./config/Colors";
import FontSizes from "./config/FontSizes";

const Menu = (props) => {
	return (
		<DrawerContentScrollView style={[styles.container, { width: useWindowDimensions().width }]}>
			<TouchableOpacity
				style={styles.header}
				onPress={() => {
					props.navigation.closeDrawer();
				}}
			>
				<Image source={{ uri: "https://dummyimage.com/400x400/ffffff/fff" }} resizeMode="cover" style={[styles.logo]} />
				<View style={styles.info}>
					<Text style={styles.name}>Full Name</Text>
					<Text style={styles.function}>Eigenaar</Text>
				</View>
				<IconArrowBack style={styles.back} />
			</TouchableOpacity>
			<MenuCard
				title="Test"
				routes={[
					{
						title: "Bla",
						onPress: () => {},
					},
				]}
			/>
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
