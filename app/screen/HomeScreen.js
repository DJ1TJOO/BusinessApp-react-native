import React from "react";
import { StyleSheet } from "react-native";

import Card from "../components/Card";
import Heading from "../components/Heading";
import { IconCheck, IconCross } from "../components/Icons";
import MenuCard from "../components/menu/MenuCard";
import Wrapper from "../components/Wrapper";

const HomeScreen = ({ navigation }) => {
	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Heading title="Laatste meldingen" style={styles.heading} />
			<Card title="Uren week 10" description="De uren die u had ingevuld voor week 10  zijn goedgekeurd." icon={IconCheck} />
			<Card title="Bericht van Full Name 2" description="He Full Name ik heb je uren gecontroleerd en vond … niet goed. Kan je deze aanpassen?" />
			<Card title="Uren week 9" description="De uren die u had ingevuld voor week 9 zijn afgekeurd. Pas deze aan." icon={IconCross} />

			<Heading title="Inkomende berichten" style={styles.heading} />
			<MenuCard title="Team" style={styles.menuCard} />
			<MenuCard title="Full Name 3" style={styles.menuCard} />

			<Heading title="Toegewezen tickets" style={styles.heading} />
			<Card
				title="Klant - Organisatie"
				description="Klant heeft probleem. bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla"
			/>
			<Card
				title="Klant 2 - Organisatie 2"
				description="Klant heeft probleem. bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla"
			/>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	heading: {},
	menuCard: {},
});

export default HomeScreen;
