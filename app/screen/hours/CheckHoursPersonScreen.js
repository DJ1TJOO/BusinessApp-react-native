import React from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import Card from "../../components/Card";
import FormButton from "../../components/form/FormButton";
import { IconCross, IconCheck } from "../../components/Icons";
import MenuCard from "../../components/menu/MenuCard";

const CheckHoursPersonScreen = ({ navigation }) => {
	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Heading title="Uren" style={styles.heading} />
			<MenuCard
				title="Uren week 11"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursWeek");
				}}
			/>
			<MenuCard
				title="Uren week 10"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursWeek");
				}}
			/>
			<MenuCard
				title="Uren week 9"
				onPress={() => {
					//TODO: data
					navigation.navigate("CheckHoursWeek");
				}}
			/>
			<MenuCard
				title="Uren week 8"
				onPress={() => {
					//TODO: data
					navigation.navigate("ViewHours");
				}}
			/>
		</Wrapper>
	);
};

export default CheckHoursPersonScreen;

const styles = StyleSheet.create({});
