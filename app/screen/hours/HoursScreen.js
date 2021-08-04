import React, { useState, useEffect, useContext } from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import Card from "../../components/Card";
import FormButton from "../../components/form/FormButton";
import { IconCross, IconCheck, IconLoading } from "../../components/Icons";

import config from "../../config/config";

import languagesUtils from "../../languages/utils";

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
	let d;

	// Find week that 31 Dec is in. If is first week, reduce date until
	// get previous week.
	do {
		d = new Date(year, month, day--);
		week = getWeekNumber(d)[1];
	} while (week == 1);

	return week;
};

const HoursScreen = ({ navigation, route }) => {
	const [currentError, setCurrentError] = useState();

	const currentYear = new Date().getFullYear();
	const [cards, setCards] = useState([]);
	const [latestYear, setLatestYear] = useState(currentYear);

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

	const getYear = (year) => {
		// Get hours data
		return getData(year)
			.then(() => {
				// Add year heading
				if (year !== currentYear && cards.findIndex((x) => x.key === year + " 54") < 0) cards.push(<Heading key={year + " 54"} title={year} style={styles.heading} />);

				for (let i = year === currentYear ? getWeekNumber(new Date())[1] + 1 : weeksInYear(year); i > 0; i--) {
					const index = cards.findIndex((x) => x.key === year + " " + i);

					let hours = data.hours.find((x) => x.year === year && x.week === i);

					// Create new hours
					if (!hours) {
						hours = {
							user_id: data.user.id,
							business_id: data.user.businessId,
							hours: [],
							year: year,
							week: i,
							valid: null,
						};

						// Add to data
						data.hours.push(hours);
					}

					// Create card
					const card = (
						<Card
							key={year + " " + i}
							title={"Uren week " + i}
							description={
								hours.valid === true
									? "De uren die u had ingevuld voor week " + i + " zijn goedgekeurd"
									: hours.valid === false
									? "De uren die u had ingevuld voor week " + i + " zijn afgekeurd. Pas deze aan"
									: hours.submitted
									? "De uren voor week " + i + " zijn ingeleverd"
									: "Vul uw uren in voor week " + i
							}
							onPress={() => {
								if (hours.valid === true || hours.submitted) {
									navigation.navigate("ViewHours", { year: hours.year, week: hours.week });
								} else {
									navigation.navigate("ChangeHours", { year: hours.year, week: hours.week });
								}
							}}
							icon={hours.valid === true ? IconCheck : hours.valid === false ? IconCross : null}
						>
							{hours.valid !== true && !hours.submitted && hours.hours.length > 0 && (
								<FormButton
									onPress={async () => {
										try {
											// Submit hours
											const res = await fetch(`${config.api}hours/${hours.id}`, {
												method: "PATCH",
												headers: {
													Accept: "application/json",
													"Content-Type": "application/json",
												},
												body: JSON.stringify({
													submitted: true,
													valid: null,
												}),
											}).then((res) => res.json());
											if (!res.success) {
												setCurrentError(
													languagesUtils.convertError(data.language, res, { submitted: true, valid: null }, "uren", {
														submitted: "ingediend",
														valid: "valide",
													})
												);

												return;
											}

											// Update data
											data.hours.find((x) => x.year === year && x.week === i).submitted = true;
											setData({ ...data });

											// Rerender
											getYear(hours.year);

											navigation.navigate("Hours");
										} catch (error) {
											// TODO: send error to server
											console.log(error);
										}
									}}
								>
									Inleveren
								</FormButton>
							)}
						</Card>
					);

					// Add card to list
					if (index > -1) {
						cards.splice(index, 1);
					}
					cards.push(card);
				}

				// Update data
				setData({ ...data });

				// Sort cards
				cards.sort((a, b) => {
					const [aYear, aWeek] = a.key.split(" ").map(Number);
					const [bYear, bWeek] = b.key.split(" ").map(Number);
					return aYear < bYear ? 1 : aYear > bYear ? -1 : aWeek < bWeek ? 1 : aWeek > bWeek ? -1 : 0;
				});

				// Update cards
				setCards([...cards]);

				if (loading) setLoading(false);
			})
			.catch((error) => {
				// TODO: send error to server
				console.log(error);
			});
	};

	// Add cards
	useEffect(() => {
		getYear(latestYear);
	}, []);

	useEffect(() => {
		if (!route.params) return;
		if (!route.params.update) return;
		route.params.update.forEach((year) => {
			getYear(year);
		});
	}, [route]);

	return (
		<Wrapper
			error={currentError}
			navigation={navigation}
			showHeader={true}
			hitBottom={() => {
				setLoading(true);

				// Get new data
				getYear(latestYear - 1);

				// Update latest year
				setLatestYear(latestYear - 1);
			}}
			loading={!data.hours}
			refresh={async () =>
				new Promise((res, rej) => {
					// Reset hours
					data.hours = [];
					setData({ ...data });
					const promise = Promise.resolve();

					for (let i = latestYear; i <= currentYear; i++) {
						promise.then(() => getYear(i));
					}

					promise.then(() => {
						res();
					});
				})
			}
		>
			<Heading title={"Uren - " + currentYear} style={styles.heading} />
			{cards}
			{loading && <IconLoading style={{ width: 70, height: 70, alignSelf: "center" }} />}
		</Wrapper>
	);
};

export default HoursScreen;

const styles = StyleSheet.create({});
