import React from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import MenuCard from "../../components/menu/MenuCard";

const CheckHoursScreen = ({ navigation }) => {
	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Heading title="Uren controleren" style={styles.heading} />
			<MenuCard
				title="Full Name"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursPerson");
				}}
			/>
			<MenuCard
				title="Full Name 1"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursPerson");
				}}
			/>
			<MenuCard
				title="Full Name 2"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursPerson");
				}}
			/>
			<MenuCard
				title="Full Name 3"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursPerson");
				}}
			/>
		</Wrapper>
	);
};

export default CheckHoursScreen;

const styles = StyleSheet.create({});
