import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import { IconCheck, IconDown } from "../Icons";
import FormInput from "./FormInput";

/**
 * @param {Array<String>} valueToFormat
 * @returns
 */
const format = (valueToFormat) => {
	const formatted = valueToFormat.join(", ").replace(/.+(,.+)$/g, (a, b) => {
		const string = b.replace(/,/g, "en");
		return a.replace(new RegExp(b + "$"), " ") + string;
	});
	return formatted;
};

/**
 * @param {String} formatToValue
 */
const formatToValue = (formatToValue) => {
	// Split up and trim
	const values = formatToValue
		.trim()
		.split(", ")
		.map((x) => x.trim());

	// Split up all en
	const hasEn = values.filter((x) => x.includes("en "));
	for (let i = 0; i < hasEn.length; i++) {
		const string = hasEn[i];

		// Remove from values
		values.splice(values.indexOf(string), 1);

		// Split up and trim
		values.push(...string.split("en ").map((x) => x.trim()));
	}

	// Remove duplicates
	for (let i = 0; i < values.length; i++) {
		const value = values[i];

		// Check if not empty and not duplicate
		if (value !== "" && values.filter((x) => x === value).length < 2) continue;

		// Remove
		values.splice(i, 1);
	}

	// Remove empty strings
	return values;
};

const getValueToSet = (value, defaultValue, multiple) => {
	if (!multiple) {
		return value || defaultValue;
	} else {
		if (value && value.length > 0) {
			return value;
		} else {
			return [...defaultValue];
		}
	}
};

const FormSelect = ({ data, value, onItemSelected, allowsCustomValue, selected, onSelected, multiple, defaultValue, onChange, validator, ...otherProps }) => {
	let [currentValue, setCurrentValue] = useState(getValueToSet(value, defaultValue, multiple));
	const [inputValue, setInputValue] = useState(multiple ? format(currentValue) : currentValue);
	const [currentSelected, setCurrentSelected] = useState(!!selected);
	const [currentErrorLabel, setCurrentErrorLabel] = useState(null);
	const [isValid, setIsValid] = useState(null);

	useEffect(() => {
		const newValue = getValueToSet(value, defaultValue, multiple);
		if (currentValue !== newValue) checkValue(newValue, false);
	}, [value]);

	useEffect(() => {
		setCurrentSelected(selected);
	}, [selected]);

	useEffect(() => {
		if (multiple) setInputValue(format(currentValue));
		else setInputValue(currentValue);
	}, [currentValue]);

	const checkValue = (value, callOnChange = true) => {
		setCurrentValue(value);
		const valid = validate(true, value);
		if (onChange && callOnChange) onChange(value, valid);
	};

	const validate = (feedback = false, value = null) => {
		if (validator) {
			const valid = validator(value || currentValue);
			if (valid === true) {
				if (feedback) {
					setCurrentErrorLabel(null);
					setIsValid(true);
				}
				return true;
			} else {
				if (feedback) {
					setCurrentErrorLabel(valid);
					setIsValid(false);
				}
				return false;
			}
		}
		return true;
	};

	return (
		<FormInput
			editable={!!allowsCustomValue}
			onPress={() => {
				if (!allowsCustomValue) {
					if (onSelected) onSelected(!currentSelected);
					setCurrentSelected(!currentSelected);
				}
			}}
			value={inputValue}
			style={[styles.select]}
			innerStyle={[currentSelected && styles.selectSelected]}
			errorLabel={currentErrorLabel}
			valid={isValid}
			onChange={(text) => text !== inputValue && setInputValue(text)}
			onEndEditing={(e) => {
				if (!allowsCustomValue) return;

				// Get real value
				/** @type {Array<String>} */
				let value = e.nativeEvent.text;
				if (multiple) {
					value = formatToValue(value);

					// Filter and sort
					value = value.filter((x) => data.includes(x));
					value.sort((a, b) => data.indexOf(a) - data.indexOf(b));

					// Check if different
					if (value.join(",") === currentValue.join(",")) {
						// Update text to current value
						if (multiple) {
							setInputValue(format(currentValue));
						}
					} else {
						// Update value
						checkValue(value);
					}
				} else {
					// Check if different
					if (value !== currentValue) {
						// Update value
						checkValue(value);
					}
				}
			}}
			{...otherProps}
		>
			<TouchableOpacity
				style={styles.selectIconTouch}
				onPress={() => {
					if (onSelected) onSelected(!currentSelected);
					setCurrentSelected(!currentSelected);
				}}
			>
				<View style={styles.selectIcon}>
					<IconDown style={styles.selectIconDown} />
				</View>
			</TouchableOpacity>
			{currentSelected && (
				<TouchableOpacity
					onPress={() => {
						if (onSelected) onSelected(true);
						setCurrentSelected(true);
					}}
				>
					<ScrollView scrollEnabled={false} horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
						<FlatList
							data={data}
							style={[styles.selectSelector]}
							keyExtractor={(item, index) => index.toString()}
							renderItem={({ item, index }) => (
								<TouchableOpacity
									key={index}
									style={styles.selectSelectorItem}
									onPress={() => {
										if (!multiple) {
											checkValue(item);
											if (onSelected) onSelected(false);
											setCurrentSelected(false);
										} else {
											const index = currentValue.indexOf(item);
											if (index < 0) {
												if (currentValue.filter((v, i) => defaultValue[i] === v).length === defaultValue.length) currentValue = [];
												currentValue.push(item);
											} else {
												currentValue.splice(index, 1);

												if (currentValue.length < 1) {
													currentValue = !multiple ? { ...defaultValue } : [...defaultValue];
												}
											}
											currentValue.sort((a, b) => data.indexOf(a) - data.indexOf(b));
											checkValue([...currentValue]);
										}
									}}
								>
									<Text style={styles.selectSelectorItemText}>{item}</Text>
									{!!multiple && currentValue.includes(item) && <IconCheck style={styles.icon} color={Colors.textPrimary} />}
								</TouchableOpacity>
							)}
						></FlatList>
					</ScrollView>
				</TouchableOpacity>
			)}
		</FormInput>
	);
};
const styles = StyleSheet.create({
	icon: {
		position: "absolute",
		left: "100%",
		marginLeft: -15,
		width: 28,
		height: 28,
	},
	select: {
		marginBottom: 5,
	},
	selectIconTouch: {
		height: 38,
		width: 38,

		left: "100%",
		marginLeft: -38,
		marginTop: -38,
		borderRadius: 8,

		justifyContent: "center",
		alignContent: "center",
	},
	selectIcon: {
		backgroundColor: Colors.secondary,
		height: 30,
		width: 30,

		borderRadius: 8,

		justifyContent: "center",
		alignContent: "center",

		left: 4,
	},
	selectIconDown: {
		marginTop: -18,
		left: 5,
	},
	selectSelected: {
		borderBottomRightRadius: 0,
		borderBottomLeftRadius: 0,
		borderColor: Colors.textPrimary,
		color: Colors.textPrimary,
	},
	selectSelector: {
		borderWidth: 2,
		borderColor: Colors.textPrimary,
		borderBottomRightRadius: 12,
		borderBottomLeftRadius: 12,
		marginTop: -2,
		maxHeight: 196,
	},
	selectSelectorItem: {
		borderBottomColor: Colors.textPrimary,
		borderBottomWidth: 2,
		padding: 10,
	},
	selectSelectorItemText: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
});

export default FormSelect;
