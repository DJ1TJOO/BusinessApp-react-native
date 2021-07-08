import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedbackBase, View } from "react-native";

import { IconAgenda, IconAgendaSelected, IconArrowDown, IconArrowUp, IconDown, IconUp } from "../Icons";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const monthDays = function (date) {
	return new Date(date.getFullYear(), date.getMonth() - 1, 0).getDate();
};

const day = function (date) {
	return new Date(date.getFullYear(), date.getMonth()).getDay();
};

const daysInMonth = function (date) {
	const offset = day(date) - 1;
	const month = monthDays(date);
	const days = [];

	for (let i = 0; i < offset; i++) {
		days.push("");
	}
	for (let i = 1; i <= month; i++) {
		days.push(i);
	}

	const daysInMonth = [];
	for (let i = 0; i < days.length; i += 7) {
		daysInMonth.push(days.slice(i, i + 7));
	}

	for (let i = 0; i < daysInMonth.length; i++) {
		const length = daysInMonth[i].length;
		if (length > 6) continue;

		daysInMonth[i].length = 7;
		for (let j = 0; j < daysInMonth[i].length; j++) {
			if (typeof daysInMonth[i][j] === "undefined") daysInMonth[i][j] = "";
		}
	}

	return daysInMonth;
};

const FormDate = ({ label, helpLabel, helpOnPress, errorLabel, errorOnPress, date, links, time, onChange, validate }) => {
	const [currentDate, setCurrentDate] = useState(date || new Date());
	const [currentViewDate, setCurrentViewDate] = useState(date || new Date());
	const [isSelectingMonth, setIsSelectingMonth] = useState(false);
	const [isSelectingTime, setIsSelectingTime] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const [currentErrorLabel, setCurrentErrorLabel] = useState(errorLabel);
	const [isValid, setIsValid] = useState(null);

	useEffect(() => {
		if (!currentDate) return;

		if (validate) {
			const valid = validate(currentDate);
			if (valid === true) {
				setCurrentErrorLabel(null);
				setIsValid(true);
			} else {
				setCurrentErrorLabel(valid);
				setIsValid(false);
			}
		}
		onChange(currentDate);
	}, [currentDate]);

	let data;
	if (isSelectingMonth) {
		data = [];
		for (let i = 0; i < 12; i++) {
			data.push(new Date(currentViewDate.getFullYear(), i));
		}
	} else data = daysInMonth(currentViewDate);

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			{currentErrorLabel && (
				<TouchableOpacity onPress={errorOnPress}>
					<Text style={styles.errorButtonText}>{currentErrorLabel}</Text>
				</TouchableOpacity>
			)}
			<TouchableOpacity
				onPress={() => setIsFocused(!isFocused)}
				style={[
					styles.currentDateBox,
					isValid === true && {
						borderColor: Colors.primary,
					},
					isValid === false && {
						borderColor: Colors.red,
					},
					isFocused && styles.currentDateBoxFocused,
				]}
			>
				{isFocused ? (
					<IconAgendaSelected style={styles.icon} />
				) : (
					<IconAgenda style={styles.icon} color={isValid === true ? Colors.primary : isValid === false ? Colors.red : null} />
				)}
				<Text
					style={[
						styles.currentDate,

						isValid === true && {
							color: Colors.primary,
						},
						isValid === false && {
							color: Colors.red,
						},
						isFocused && styles.currentDateFocused,
					]}
				>
					{currentDate.toLocaleDateString()}
				</Text>
				{helpLabel && (
					<TouchableOpacity onPress={helpOnPress}>
						<Text style={styles.helpButtonText}>{helpLabel}</Text>
					</TouchableOpacity>
				)}
			</TouchableOpacity>
			{isFocused && (
				<View
					style={(() => {
						const style = [styles.dateBox];

						if (isSelectingMonth) {
							style.push({
								height: 145,
							});
						} else {
							if (data.length > 5)
								style.push({
									height: 205,
								});
							else if (data.length < 4)
								style.push({
									height: 165,
								});
						}
						if (label)
							style.push({
								top: 63,
							});
						if (currentErrorLabel)
							style.push({
								top: 85,
							});
						return style;
					})()}
				>
					<View style={styles.dateSelector}>
						<View>
							<TouchableOpacity
								style={styles.monthSelectorUp}
								onPress={() => {
									if (isSelectingMonth) setCurrentViewDate(new Date(currentViewDate.getFullYear() - 1, currentViewDate.getMonth()));
									else setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1));
								}}
							>
								<IconArrowUp style={styles.monthSelectorIcon} />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.monthSelectorDown}
								onPress={() => {
									if (isSelectingMonth) setCurrentViewDate(new Date(currentViewDate.getFullYear() + 1, currentViewDate.getMonth()));
									else setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1));
								}}
							>
								<IconArrowDown style={styles.monthSelectorIcon} />
							</TouchableOpacity>
							<TouchableOpacity onPress={() => (isSelectingTime ? setIsSelectingTime(!isSelectingTime) : setIsSelectingMonth(!isSelectingMonth))}>
								<Text style={styles.monthSelectorDate}>
									{currentViewDate.toLocaleString(
										"default",
										isSelectingMonth
											? { year: "numeric" }
											: isSelectingTime
											? { day: "numeric", month: "long", year: "numeric" }
											: { month: "long", year: "numeric" }
									)}
								</Text>
							</TouchableOpacity>

							{!isSelectingMonth && (
								<TouchableOpacity
									style={styles.monthSelectorChoose}
									onPress={() => (isSelectingTime ? setIsSelectingTime(!isSelectingTime) : setIsSelectingMonth(!isSelectingMonth))}
								>
									<IconDown style={styles.monthSelectorIcon} />
								</TouchableOpacity>
							)}
						</View>
						{!isSelectingMonth && !isSelectingTime && (
							<View style={styles.days}>
								<Text key="Ma" style={styles.day}>
									Ma
								</Text>
								<Text key="Di" style={styles.day}>
									Di
								</Text>
								<Text key="Wo" style={styles.day}>
									Wo
								</Text>
								<Text key="Do" style={styles.day}>
									Do
								</Text>
								<Text key="Vr" style={styles.day}>
									Vr
								</Text>
								<Text key="Za" style={styles.day}>
									Za
								</Text>
								<Text key="Zo" style={styles.day}>
									Zo
								</Text>
							</View>
						)}
						{!isSelectingMonth && !isSelectingTime && (
							<View style={styles.daySelector}>
								{(() => {
									let i = 0;
									return data.map((x) => (
										<View style={styles.daySelectorRow} key={i}>
											{x.map((y) => {
												i++;
												return y === currentDate.getDate() &&
													currentViewDate.getMonth() === currentDate.getMonth() &&
													currentViewDate.getFullYear() === currentDate.getFullYear() ? (
													<TouchableOpacity
														key={i}
														style={styles.daySelectorDaySelectedView}
														onPress={() => {
															if (time) setIsSelectingTime(true);
														}}
													>
														<Text style={[styles.daySelectorDay, styles.daySelectorDaySelected]}>{y}</Text>
													</TouchableOpacity>
												) : (
													<TouchableOpacity
														key={i}
														onPress={() => {
															if (y === "") return;
															setCurrentDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), y));
															if (time) setIsSelectingTime(true);
														}}
													>
														<Text style={styles.daySelectorDay}>{y}</Text>
													</TouchableOpacity>
												);
											})}
										</View>
									));
								})()}
							</View>
						)}
						{isSelectingMonth && !isSelectingTime && (
							<View style={styles.monthSelector}>
								{data.map((x) =>
									x.getMonth() === currentDate.getMonth() && x.getFullYear() === currentDate.getFullYear() ? (
										<TouchableOpacity key={x} style={styles.monthSelectorMonthSelectedView} onPress={() => setIsSelectingMonth(false)}>
											<Text style={[styles.monthSelectorMonth, styles.monthSelectorMonthSelected]}>{x.toLocaleString("default", { month: "short" })}</Text>
										</TouchableOpacity>
									) : (
										<TouchableOpacity
											key={x}
											onPress={() => {
												setCurrentViewDate(new Date(x.getFullYear(), x.getMonth(), currentViewDate.getDate()));
												setIsSelectingMonth(false);
											}}
										>
											<Text style={styles.monthSelectorMonth}>{x.toLocaleString("default", { month: "short" })}</Text>
										</TouchableOpacity>
									)
								)}
							</View>
						)}
						{!isSelectingMonth && isSelectingTime && (
							<View style={styles.timeSelector}>
								<View style={styles.timeSlider}>
									<Text style={styles.timeSliderHeader}>Uren</Text>
									<TouchableOpacity
										style={styles.timeSliderButton}
										onPress={() =>
											setCurrentDate(
												new Date(
													currentDate.getFullYear(),
													currentDate.getMonth(),
													currentDate.getDate(),
													currentDate.getHours() <= 0 ? 23 : currentDate.getHours() - 1,
													currentDate.getMinutes()
												)
											)
										}
									>
										<IconUp />
									</TouchableOpacity>
									<Text style={styles.timeSliderText}>
										{new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours() - 1).getHours()}
									</Text>
									<View style={styles.timeSliderTextViewSelected}>
										<Text style={[styles.timeSliderText, styles.timeSliderTextSelected]}>{currentDate.getHours()}</Text>
									</View>
									<Text style={styles.timeSliderText}>
										{new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours() + 1).getHours()}
									</Text>
									<TouchableOpacity
										style={styles.timeSliderButton}
										onPress={() =>
											setCurrentDate(
												new Date(
													currentDate.getFullYear(),
													currentDate.getMonth(),
													currentDate.getDate(),
													currentDate.getHours() >= 23 ? 0 : currentDate.getHours() + 1,
													currentDate.getMinutes()
												)
											)
										}
									>
										<IconDown />
									</TouchableOpacity>
								</View>
								<View style={styles.timeSlider}>
									<Text style={styles.timeSliderHeader}>Minuten</Text>
									<TouchableOpacity
										style={styles.timeSliderButton}
										onPress={() =>
											setCurrentDate(
												new Date(
													currentDate.getFullYear(),
													currentDate.getMonth(),
													currentDate.getDate(),
													currentDate.getHours(),
													currentDate.getMinutes() <= 0 ? 59 : currentDate.getMinutes() - 1
												)
											)
										}
									>
										<IconUp />
									</TouchableOpacity>
									<Text style={styles.timeSliderText}>
										{new Date(
											currentDate.getFullYear(),
											currentDate.getMonth(),
											currentDate.getDate(),
											currentDate.getHours(),
											currentDate.getMinutes() - 1
										).getMinutes()}
									</Text>
									<View style={styles.timeSliderTextViewSelected}>
										<Text style={[styles.timeSliderText, styles.timeSliderTextSelected]}>{currentDate.getMinutes()}</Text>
									</View>
									<Text style={styles.timeSliderText}>
										{new Date(
											currentDate.getFullYear(),
											currentDate.getMonth(),
											currentDate.getDate(),
											currentDate.getHours(),
											currentDate.getMinutes() + 1
										).getMinutes()}
									</Text>
									<TouchableOpacity
										style={styles.timeSliderButton}
										onPress={() =>
											setCurrentDate(
												new Date(
													currentDate.getFullYear(),
													currentDate.getMonth(),
													currentDate.getDate(),
													currentDate.getHours(),
													currentDate.getMinutes() >= 59 ? 0 : currentDate.getMinutes() + 1
												)
											)
										}
									>
										<IconDown />
									</TouchableOpacity>
								</View>
							</View>
						)}
					</View>
					<View style={styles.dateLinks}>
						{links
							? links.map((link) => {
									return (
										<TouchableOpacity
											style={styles.dateLink}
											onPress={() => {
												const date = link.date(currentDate, currentViewDate);
												setCurrentDate(date);
												setCurrentViewDate(date);
												setIsSelectingMonth(false);
											}}
											key={link.text(currentDate, currentViewDate)}
										>
											<Text style={styles.dateLinkText}>{link.text(currentDate, currentViewDate)}</Text>
										</TouchableOpacity>
									);
							  })
							: {}}
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		zIndex: 3,
	},
	currentDate: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	currentDateFocused: {
		color: Colors.textPrimary,
	},
	currentDateBox: {
		paddingTop: 2,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: Colors.tertiary,
		height: 38,
		paddingHorizontal: 10,
	},
	currentDateBoxFocused: {
		borderColor: Colors.textPrimary,
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
	},
	day: {
		color: Colors.textSecondary,
		fontSize: FontSizes.small,
	},
	days: {
		position: "absolute",
		flexDirection: "row",
		justifyContent: "space-evenly",
		width: 230,
		top: 30,
	},
	daySelector: {
		position: "absolute",
		top: 50,
	},
	daySelectorRow: {
		flexDirection: "row",
		width: 230,
		justifyContent: "space-evenly",
	},
	daySelectorDay: {
		color: Colors.textPrimary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",

		width: 25,
		height: 25,
		textAlign: "center",
	},
	daySelectorDaySelectedView: {
		borderRadius: 20,
		backgroundColor: Colors.primary,
	},
	daySelectorDaySelected: {
		color: Colors.white,
	},
	dateBox: {
		position: "absolute",
		top: 36,
		height: 185,

		width: "100%",

		borderBottomRightRadius: 12,
		borderBottomLeftRadius: 12,
		borderWidth: 2,
		borderColor: Colors.textPrimary,

		backgroundColor: Colors.white,
	},
	dateLinks: {
		flex: 1,
		flexDirection: "column",

		top: 5,
		left: "100%",
		marginLeft: -105,

		width: 100,
	},
	dateLink: {},
	dateLinkText: {
		color: Colors.primary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		textAlign: "right",
	},
	dateSelector: {},
	errorButtonText: {
		color: Colors.red,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	helpButtonText: {
		color: Colors.primary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
	},
	icon: {
		position: "absolute",
		top: 3,
		left: "100%",
		marginLeft: -11,
		width: 28,
		height: 28,
	},
	label: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	monthSelectorIcon: {
		top: 0,
		width: 17,
		height: 17,
	},
	monthSelectorUp: {
		position: "absolute",
		top: 6,
		left: 6,
		padding: 4,
	},
	monthSelectorDown: {
		position: "absolute",
		top: 6,
		left: 29,
		padding: 4,
	},
	monthSelectorDate: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		position: "absolute",
		top: 4,
		left: 55,
		textAlign: "center",
		width: 150,
	},
	monthSelectorChoose: {
		position: "absolute",
		top: 10,
		left: 205,
	},
	monthSelectorMonth: {
		color: Colors.textPrimary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",

		width: 35,
		height: 35,
		textAlign: "center",

		marginRight: 10,
	},
	monthSelector: {
		width: 230,
		flexDirection: "row",
		flexWrap: "wrap",
		top: 35,
		left: 10,
		position: "absolute",
	},
	monthSelectorMonthSelectedView: {
		borderRadius: 20,
		backgroundColor: Colors.primary,
		marginRight: 10,
		marginLeft: -2,
		marginTop: -3,
		height: 35,
	},
	monthSelectorMonthSelected: {
		left: 2,
		marginTop: 3,
		marginRight: 0,
		color: Colors.white,
	},
	timeSelector: {
		width: 230,
		flexDirection: "row",
		top: 35,
		left: 10,
		position: "absolute",
		justifyContent: "space-between",
	},
	timeSlider: {
		width: 100,
		justifyContent: "space-around",
	},
	timeSliderHeader: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		textAlign: "center",
	},
	timeSliderText: {
		color: Colors.textPrimary,
		fontSize: FontSizes.default,
		textAlign: "center",
	},
	timeSliderTextSelected: {
		color: Colors.white,
	},
	timeSliderTextViewSelected: {
		borderRadius: 20,
		backgroundColor: Colors.primary,
		width: 28,
		height: 28,
		marginLeft: 36,
		justifyContent: "center",
		alignContent: "center",
	},
	timeSliderButton: {
		marginLeft: 40,
		top: -10,
	},
});

export default FormDate;
