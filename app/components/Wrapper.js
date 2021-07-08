import React, { useRef } from "react";
import { StyleSheet, ScrollView, Animated, StatusBar } from "react-native";

import SafeView from "./SafeView";
import Header from "./Header";

const Wrapper = ({ children, style, showHeader, navigation }) => {
	const offset = useRef(new Animated.Value(0)).current;
	const scrollView = useRef();

	return (
		<SafeView>
			{showHeader && <Header navigation={navigation} scrollView={scrollView} animatedValue={offset} />}
			<ScrollView
				ref={scrollView}
				showsVerticalScrollIndicator={false}
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

					if (e.nativeEvent.contentOffset.y > 20) StatusBar.setBarStyle("light-content");
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
