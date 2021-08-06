import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, Dimensions } from "react-native";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import { IconDown, IconCheck } from "../Icons";
import FormInput from "./FormInput";

const format = (valueToFormat) => {
	const formatted = valueToFormat.join(", ").replace(/.+(,.+)$/g, (a, b) => {
		const string = b.replace(/,/g, "en");
		return a.replace(new RegExp(b + "$"), " ") + string;
	});
	return formatted;
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
	const [currentSelected, setCurrentSelected] = useState(!!selected);
	const [currentErrorLabel, setCurrentErrorLabel] = useState(null);
	const [isValid, setIsValid] = useState(null);

	useEffect(() => {
		const newValue = getValueToSet(value, defaultValue, multiple);
		if (value !== newValue) checkValue(newValue);
	}, [value]);

	useEffect(() => {
		setCurrentSelected(selected);
	}, [selected]);

	const checkValue = (value) => {
		setCurrentValue(value);
		const valid = validate(true, value);
		if (onChange) onChange(value, valid);
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
			onTouchStart={() => {
				if (!allowsCustomValue) {
					if (onSelected) onSelected(!currentSelected);
					setCurrentSelected(!currentSelected);
				}
			}}
			value={!multiple ? currentValue : format(currentValue)}
			style={[styles.select]}
			innerStyle={[currentSelected && styles.selectSelected]}
			errorLabel={currentErrorLabel}
			valid={isValid}
			// TODO: custom values onchange
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
		marginTop: 6,
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
