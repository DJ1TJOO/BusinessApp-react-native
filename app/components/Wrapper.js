import React, { useRef } from "react";
import { StyleSheet, ScrollView, Animated, StatusBar, View, Platform } from "react-native";

import SafeView from "./SafeView";
import Header from "./Header";
import Colors from "../config/Colors";

import interpolate from "color-interpolate";
import wrapperScrollViewContext from "../contexts/wrapperScrollViewContext";

const interpolation = interpolate([Colors.white, Colors.primary]);
const Wrapper = ({ children, style, showHeader, navigation, scrollEnabled }) => {
	const offset = useRef(new Animated.Value(0)).current;
	const scrollView = useRef();

	return (
		<SafeView>
			{showHeader && <Header navigation={navigation} scrollView={scrollView} animatedValue={offset} />}
			<wrapperScrollViewContext.Provider value={scrollView}>
				<ScrollView
					nestedScrollEnabled={true}
					scrollEnabled={scrollEnabled}
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

						if (Platform.OS === "android") {
							const procent = (Math.min(Math.max(offset._value, 5), 55) - 5) / 50;
							StatusBar.setBackgroundColor(interpolation(procent));
						}
					}}
					scrollEventThrottle={1}
					keyboardDismissMode="interactive"
					style={[styles.wrapper, style]}
				>
					{children}
					<View style={{ height: 50, width: "100%", backgroundColor: Colors.white }} />
				</ScrollView>
			</wrapperScrollViewContext.Provider>
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
