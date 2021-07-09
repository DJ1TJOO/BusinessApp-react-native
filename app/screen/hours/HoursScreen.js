import React from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import Card from "../../components/Card";
import FormButton from "../../components/form/FormButton";
import { IconCross, IconCheck } from "../../components/Icons";

const HoursScreen = ({ navigation }) => {
	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Heading title="Uren" style={styles.heading} />
			<Card
				title="Uren week 11"
				description="Vul uw uren in voor week 11"
				onPress={() => {
					//TODO: data
					navigation.navigate("ChangeHours");
				}}
			/>
			<Card
				title="Uren week 10"
				description="De uren die u had ingevuld voor week 10 zijn goedgekeurd."
				onPress={() => {
					//TODO: data
					navigation.navigate("ChangeHours");
				}}
			>
				<FormButton>Inleveren</FormButton>
			</Card>
			<Card
				title="Uren week 9"
				description="De uren die u had ingevuld voor week 9 zijn afgekeurd. Pas deze aan."
				onPress={() => {
					//TODO: data
					navigation.navigate("ChangeHours");
				}}
				icon={IconCross}
			/>
			<Card
				title="Uren week 8"
				description="De uren die u had ingevuld voor week 8 zijn goedgekeurd."
				onPress={() => {
					//TODO: data
					navigation.navigate("ViewHours");
				}}
				icon={IconCheck}
			/>
		</Wrapper>
	);
};

export default HoursScreen;

const styles = StyleSheet.create({});
