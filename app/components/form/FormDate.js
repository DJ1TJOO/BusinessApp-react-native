import React, { useState } from "react";
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedbackBase, View } from "react-native";

import { IconAgenda, IconAgendaSelected, IconArrowDown, IconArrowUp, IconUp } from "../Icons";
import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

const monthDays = function (date) {
	return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
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

const FormDate = ({ label, helpLabel, helpOnPress, viewDate }) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [currentViewDate, setCurrentViewDate] = useState(viewDate || new Date());
	const [isFocused, setIsFocused] = useState(false);

	const days = daysInMonth(currentViewDate);

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			<TouchableOpacity onPress={() => setIsFocused(!isFocused)} style={isFocused ? [styles.currentDateBox, styles.currentDateBoxFocused] : styles.currentDateBox}>
				{isFocused ? <IconAgendaSelected style={styles.icon} /> : <IconAgenda style={styles.icon} />}
				<Text style={isFocused ? [styles.currentDate, styles.currentDateFocused] : styles.currentDate}>{currentDate.toLocaleDateString()}</Text>
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

						if (days.length > 5) style.push(styles.dateBoxLong);
						else if (days.length < 4) style.push(styles.dateBoxShort);
						if (label) style.push(styles.dateBoxWithLabel);

						return style;
					})()}
				>
					<View style={styles.dateSelector}>
						<View style={styles.monthSelector}>
							<TouchableOpacity
								style={styles.monthSelectorUp}
								onPress={() => {
									setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1));
								}}
							>
								<IconArrowUp style={styles.monthSelectorIcon} />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.monthSelectorDown}
								onPress={() => {
									setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1));
								}}
							>
								<IconArrowDown style={styles.monthSelectorIcon} />
							</TouchableOpacity>
							<Text style={styles.monthSelectorDate}>{currentViewDate.toLocaleString("default", { month: "long", year: "numeric" })}</Text>
							<TouchableOpacity style={styles.monthSelectorChoose}>
								<IconUp style={styles.monthSelectorIcon} />
							</TouchableOpacity>
						</View>
						<View style={styles.days}>
							<Text style={styles.day}>Ma</Text>
							<Text style={styles.day}>Di</Text>
							<Text style={styles.day}>Wo</Text>
							<Text style={styles.day}>Do</Text>
							<Text style={styles.day}>Vr</Text>
							<Text style={styles.day}>Za</Text>
							<Text style={styles.day}>Zo</Text>
						</View>
						<View style={styles.daySelector}>
							{(() => {
								let i = 0;
								return days.map((x) => (
									<View style={styles.daySelectorRow}>
										{x.map((y) => {
											i++;
											return y === currentDate.getDate() &&
												currentViewDate.getMonth() === currentDate.getMonth() &&
												currentViewDate.getFullYear() === currentDate.getFullYear() ? (
												<TouchableOpacity style={styles.daySelectorDaySelectedView}>
													<Text key={i} style={[styles.daySelectorDay, styles.daySelectorDaySelected]}>
														{y}
													</Text>
												</TouchableOpacity>
											) : (
												<TouchableOpacity
													onPress={() => y !== "" && setCurrentDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), y))}
												>
													<Text key={i} style={styles.daySelectorDay}>
														{y}
													</Text>
												</TouchableOpacity>
											);
										})}
									</View>
								));
							})()}
						</View>
					</View>
					<View style={styles.dateLinks}>
						<TouchableOpacity style={styles.dateLink}>
							<Text style={styles.dateLinkText}>Vandaag</Text>
						</TouchableOpacity>
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
	dateBoxWithLabel: {
		top: 63,
	},
	dateBoxLong: {
		height: 205,
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
	monthSelector: {},
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
});

export default FormDate;
