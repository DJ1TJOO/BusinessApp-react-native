import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, Animated, StatusBar, View, Platform, RefreshControl, Dimensions, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import SafeView from "./SafeView";
import Header from "./Header";
import Colors from "../config/Colors";

import interpolate from "color-interpolate";
import wrapperScrollViewContext from "../contexts/wrapperScrollViewContext";
import Loading from "./Loading";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconLoading } from "./Icons";
import useErrorModal from "../hooks/useErrorModal";

const interpolation = interpolate([Colors.white, Colors.primary]);
const Wrapper = ({ children, style, showHeader, navigation, scrollEnabled, hitBottom, refresh, loading, error }) => {
	const offset = useRef(new Animated.Value(0)).current;
	const scrollView = useRef();
	let hasHitBottom = false;

	const [headerLayout, setHeaderLayout] = useState({ x: 0, y: 0, height: 0, width: 0 });

	const [refreshing, setRefreshing] = useState(false);
	const endRefresh = () => {
		setTimeout(() => {
			setRefreshing(false);
		}, 500);
	};
	const doRefresh = () => {
		setRefreshing(true);
		const res = refresh();
		if (res instanceof Promise) {
			res.then(endRefresh);
		} else {
			endRefresh();
		}
	};

	const refreshControl = {};
	if (typeof refresh === "function") {
		refreshControl.refreshControl = (
			<RefreshControl refreshing={refreshing} onRefresh={doRefresh} tintColor="transparent" colors={["transparent"]} style={{ backgroundColor: "transparent" }} />
		);
	}

	const [isLoading, setIsLoading] = useState(loading);
	useEffect(() => {
		if (loading !== isLoading) setIsLoading(loading);
	}, [loading]);

	const [currentError, setCurrentError, ErrorModal] = useErrorModal(error);

	useEffect(() => {
		if (error !== currentError) setCurrentError(error);
	}, [error]);

	return (
		<SafeView>
			{showHeader && (
				<Header
					navigation={navigation}
					scrollView={scrollView}
					animatedValue={offset}
					onLayout={(e) => {
						setHeaderLayout(e.nativeEvent.layout);
					}}
				/>
			)}
			<wrapperScrollViewContext.Provider value={scrollView}>
				{isLoading && (
					<Loading
						size={100}
						isActive={true}
						style={{
							marginTop: headerLayout.height + useSafeAreaInsets().top,
							height: Dimensions.get("screen").height - headerLayout.height * 2 - useSafeAreaInsets().top * 2,
						}}
					/>
				)}
				{!isLoading && refreshControl.refreshControl && refreshing && (
					<IconLoading
						style={{
							position: "absolute",
							width: 60,
							height: 60,
							alignSelf: "center",
							alignItems: "center",
							justifyContent: "center",
							top: headerLayout.height + useSafeAreaInsets().top,
						}}
					/>
				)}
				{!isLoading && (
					<KeyboardAwareScrollView
						nestedScrollEnabled={true}
						scrollEnabled={scrollEnabled}
						innerRef={(ref) => {
							scrollView.current = ref;
						}}
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

							if (typeof hitBottom === "function") {
								if (e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - 20) {
									hasHitBottom = true;
								}
							}
						}}
						onScrollEndDrag={() => {
							if (!hasHitBottom) return;
							hasHitBottom = false;
							hitBottom();
						}}
						scrollEventThrottle={1}
						keyboardDismissMode="interactive"
						style={[styles.wrapper, style]}
						{...refreshControl}
					>
						{children}
						<View style={{ height: 50, width: "100%", backgroundColor: Colors.white }} />
					</KeyboardAwareScrollView>
				)}
			</wrapperScrollViewContext.Provider>
			{ErrorModal}
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
