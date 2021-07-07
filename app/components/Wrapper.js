import React, { useState, useRef } from "react";
import { StyleSheet, ScrollView, Text, View, Animated, StatusBar } from "react-native";

import SafeView from "./SafeView";
import Header from "./Header";

const Wrapper = ({ children, style, showHeader }) => {
	const offset = useRef(new Animated.Value(0)).current;
	return (
		<SafeView>
			{showHeader && <Header animatedValue={offset} />}
			<ScrollView
				onScroll={(e) => {
					Animated.event(
						[
							{
								nativeEvent: {
									contentOffset: {
										y: offset,
									},
								},
							},
						],
						{ useNativeDriver: false }
					)(e);

					if (e.nativeEvent.contentOffset.y > 25) StatusBar.setBarStyle("light-content");
					else StatusBar.setBarStyle("dark-content");
				}}
				scrollEventThrottle={1}
				keyboardDismissMode="interactive"
				style={[styles.wrapper, style]}
			>
				{children}
			</ScrollView>
		</SafeView>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		marginHorizontal: 10,
	},
});

export default Wrapper;
