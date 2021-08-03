import React, { useState, useEffect, useContext } from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import Card from "../../components/Card";
import FormButton from "../../components/form/FormButton";
import { IconCross, IconCheck, IconLoading } from "../../components/Icons";

import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

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

	const [data, setData] = useContext(dataContext);
	const [loading, setLoading] = useState(false);

	const getData = async (year) => {
		try {
			// Set hours
			if (!data.hours) data.hours = [];

			// Remove hours from current year
			data.hours = data.hours.filter((x) => x.year !== year);

			// Get hours from current year
			const res = await fetch(`${config.api}hours/users/${data.user.id}/${year}`).then((res) => res.json());

			// Add to data
			if (res.success) {
				if (Array.isArray(res.data)) {
					data.hours.push(...res.data);
				} else {
					data.hours.push(res.data);
				}
			}

			// Update data
			setData({ ...data });
		} catch (error) {
			throw error;
		}
	};

	useEffect(() => {
		// Get hours data
		getData(latestYear)
			.then(() => {
				for (let i = getWeekNumber(new Date())[1] + 1; i > 0; i--) {
					if (cards.find((x) => x.key === latestYear + " " + i)) continue;

					let hours = data.hours.find((x) => x.year === latestYear && x.week === i);

					// Create new hours
					if (!hours) {
						hours = {
							user_id: data.user.id,
							business_id: data.user.businessId,
							hours: [],
							year: latestYear,
							week: i,
							valid: null,
						};

						// Add to data
						data.hours.push(hours);
					}

					// Add card to list
					cards.push(
						<Card
							key={latestYear + " " + i}
							title={"Uren week " + i}
							description={
								hours.valid === true
									? "De uren die u had ingevuld voor week 10 zijn goedgekeurd."
									: hours.valid === false
									? "De uren die u had ingevuld voor week 9 zijn afgekeurd. Pas deze aan."
									: "Vul uw uren in voor week " + i
							}
							onPress={() => {
								if (hours.valid === true) {
									// TODO: ViewHours
									navigation.navigate("ViewHours");
								} else {
									navigation.navigate("ChangeHours", { year: hours.year, week: hours.week });
								}
							}}
							icon={hours.valid === true ? IconCheck : hours.valid === false ? IconCross : null}
						>
							{hours.valid !== true && hours.hours.length > 0 && <FormButton>Inleveren</FormButton>}
						</Card>
					);
				}
				setData({ ...data });
				setCards([...cards]);
			})
			.catch((err) => console.log(err));
	}, []);

	const addNewWeeks = () => {
		setLoading(true);

		// Update latest year
		setLatestYear(latestYear - 1);

		// Get new data
		getData(latestYear - 1)
			.then(() => {
				// Add year heading
				cards.push(<Heading key={latestYear - 1} title={latestYear - 1} style={styles.heading} />);

				// Add cards
				for (let i = weeksInYear(latestYear - 1); i > 0; i--) {
					if (cards.find((x) => x.key === latestYear - 1 + " " + i)) continue;

					let hours = data.hours.find((x) => x.year === latestYear - 1 && x.week === i);

					// Create new hours
					if (!hours) {
						hours = {
							user_id: data.user.id,
							business_id: data.user.businessId,
							hours: [],
							year: latestYear - 1,
							week: i,
							valid: null,
						};

						// Add to data
						data.hours.push(hours);
					}

					// Add card to list
					cards.push(
						<Card
							key={latestYear - 1 + " " + i}
							title={"Uren week " + i}
							description={
								hours.valid === true
									? "De uren die u had ingevuld voor week 10 zijn goedgekeurd."
									: hours.valid === false
									? "De uren die u had ingevuld voor week 9 zijn afgekeurd. Pas deze aan."
									: "Vul uw uren in voor week " + i
							}
							onPress={() => {
								if (hours.valid === true) {
									// TODO: ViewHours
									navigation.navigate("ViewHours");
								} else {
									navigation.navigate("ChangeHours", { year: hours.year, week: hours.week });
								}
							}}
							icon={hours.valid === true ? IconCheck : hours.valid === false ? IconCross : null}
						>
							{hours.valid !== true && hours.hours.length > 0 && <FormButton>Inleveren</FormButton>}
						</Card>
					);
				}
				setLoading(false);

				setData({ ...data });
				setCards([...cards]);
			})
			.catch((err) => console.log(err));
	};

	return (
		<Wrapper
			navigation={navigation}
			showHeader={true}
			hitBottom={addNewWeeks}
			loading={cards.length < 1}
			refresh={async () => new Promise((res, rej) => setTimeout(res, 1000))}
		>
			<Heading title={"Uren - " + new Date().getFullYear()} style={styles.heading} />
			{cards}
			{loading && <IconLoading style={{ width: 70, height: 70, alignSelf: "center" }} />}
		</Wrapper>
	);
};

export default HoursScreen;

const styles = StyleSheet.create({});
