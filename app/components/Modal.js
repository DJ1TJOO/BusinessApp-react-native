import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { RootSiblingPortal } from "react-native-root-siblings";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

import lastStatusBarColorContext from "../contexts/lastStatusBarColorContext";

import FormButton from "./form/FormButton";
import SafeView from "./SafeView";

export const MODAL_BUTTON_TYPES = {
	ACCEPT: "accept",
	DISMISS: "dismiss",
	CANCEL: "cancel",
};

const Modal = ({ children, error, info, icon, onDismiss, buttons = [{ text: "Oke", type: MODAL_BUTTON_TYPES.DISMISS }] }) => {
	const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, height: 0, width: 0 });
	const offset = useRef(new Animated.Value(Dimensions.get("screen").height / 1.5)).current;

	const [lastStatusBarColor, setLastStatusBarColor] = useContext(lastStatusBarColorContext);

	useEffect(() => {
		Animated.spring(offset, {
			toValue: 0,
			friction: 20,
			tension: 100,
			useNativeDriver: false,
		}).start();
	}, []);

	const overlayColor = offset.interpolate({
		inputRange: [0, Dimensions.get("screen").height / 2],
		outputRange: [Colors.textSecondary, "transparent"],
		extrapolate: "clamp",
	});

	if (Platform.OS === "android") {
		StatusBar.setBackgroundColor("#707070", true);
	}

	return (
		<RootSiblingPortal>
			<Animated.View style={[styles.overlay, { backgroundColor: overlayColor }]}>
				<SafeView style={[styles.safeView, { paddingTop: -containerLayout.height / 2 - 38 }]}>
					<Animated.View
						style={{
							transform: [{ translateY: offset }],
						}}
					>
						<View
							style={[styles.container]}
							onLayout={(e) => {
								setContainerLayout(e.nativeEvent.layout);
							}}
						>
							{icon}
							{error && <Text style={[styles.text, styles.error]}>{error}</Text>}
							{info && <Text style={[styles.text, styles.info]}>{info}</Text>}
							{children}
						</View>
						<View style={styles.buttonContainer}>
							{buttons.map(({ text, type, color }, index) => (
								<FormButton
									key={text + " " + type}
									style={[
										styles.button,
										{ width: `${100 / buttons.length}%` },
										type === MODAL_BUTTON_TYPES.CANCEL && { backgroundColor: Colors.red },
										color && { backgroundColor: color },
										index === 0 && styles.buttonStart,
										index === buttons.length - 1 && styles.buttonEnd,
									]}
									onPress={() => {
										if (Platform.OS === "android") {
											StatusBar.setBackgroundColor(lastStatusBarColor, true);
										}
										Animated.spring(offset, {
											toValue: Dimensions.get("screen").height / 1.5,
											friction: 20,
											tension: 100,
											useNativeDriver: false,
										}).start(() => onDismiss && onDismiss(text, type, color));
									}}
								>
									{text}
								</FormButton>
							))}
						</View>
					</Animated.View>
				</SafeView>
			</Animated.View>
		</RootSiblingPortal>
	);
};

const styles = StyleSheet.create({
	button: {
		borderRadius: 0,
		marginTop: 0,
	},
	buttonStart: {
		borderBottomLeftRadius: 12,
	},
	buttonEnd: {
		borderBottomRightRadius: 12,
	},
	buttonContainer: {
		marginHorizontal: 10,
		backgroundColor: Colors.white,
		borderBottomLeftRadius: 14,
		borderBottomRightRadius: 14,
		flexDirection: "row",
	},
	container: {
		backgroundColor: Colors.white,
		marginHorizontal: 10,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		marginBottom: -1,
	},
	text: {
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		margin: 10,
		textAlign: "center",
	},
	error: {
		color: Colors.red,
	},
	info: {
		color: Colors.textPrimary,
	},
	overlay: {
		position: "absolute",
		backgroundColor: Colors.textSecondary,
		width: "100%",
		top: 0,
		bottom: 0,
		zIndex: 9999,
		elevation: 2,
		overflow: "visible",
	},
	safeView: {
		justifyContent: "center",
		backgroundColor: "transparent",
	},
});

export default Modal;
