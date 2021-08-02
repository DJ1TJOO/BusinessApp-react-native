import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import Card from "../../components/Card";
import FormButton from "../../components/form/FormButton";
import { IconCross, IconCheck } from "../../components/Icons";
import Colors from "../../config/Colors";

const getWeekNumber = (d) => {
	// Copy date so don't modify original
	d = new Date(+d);
	d.setHours(0, 0, 0, 0);
	// Set to nearest Thursday: current date + 4 - current day number
	// Make Sunday's day number 7
	d.setDate(d.getDate() + 4 - (d.getDay() || 7));
	// Get first day of year
	const yearStart = new Date(d.getFullYear(), 0, 1);
	// Calculate full weeks to nearest Thursday
	const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
	// Return array of year and week number
	return [d.getFullYear(), weekNo];
};

const weeksInYear = (year) => {
	const month = 11;
	let day = 31;
	let week;

	// Find week that 31 Dec is in. If is first week, reduce date until
	// get previous week.
	do {
		d = new Date(year, month, day--);
		week = getWeekNumber(d)[1];
	} while (week == 1);

	return week;
};

const HoursScreen = ({ navigation }) => {
	const [cards, setCards] = useState([]);
	const [latestYear, setLatestYear] = useState(new Date().getFullYear());

	// TODO: get data
	useEffect(() => {
		for (let i = getWeekNumber(new Date())[1] + 1; i > 0; i--) {
			cards.push(
				<Card
					key={latestYear + " " + i}
					title={"Uren week " + i}
					description={"Vul uw uren in voor week " + i}
					onPress={() => {
						//TODO: data
						navigation.navigate("ChangeHours");
					}}
				/>
			);
		}
		setCards([...cards]);
	}, []);

	const addNewWeeks = () => {
		setLatestYear(latestYear - 1);
		cards.push(<Heading key={latestYear - 1} title={latestYear - 1} style={styles.heading} />);
		for (let i = weeksInYear(latestYear - 1); i > 0; i--) {
			cards.push(
				<Card
					key={latestYear - 1 + " " + i}
					title={"Uren week " + i}
					description={"Vul uw uren in voor week " + i}
					onPress={() => {
						//TODO: data
						navigation.navigate("ChangeHours");
					}}
				/>
			);
		}
		setCards([...cards]);
	};

	return (
		<Wrapper navigation={navigation} showHeader={true} hitBottom={addNewWeeks}>
			<Heading title={"Uren - " + new Date().getFullYear()} style={styles.heading} />
			{cards}
			{/* <Card
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
			/> */}
		</Wrapper>
	);
};

export default HoursScreen;

const styles = StyleSheet.create({});
