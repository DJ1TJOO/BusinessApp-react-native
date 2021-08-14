import interpolate from "color-interpolate";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, RefreshControl, StatusBar, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "../config/Colors";

import lastStatusBarColorContext from "../contexts/lastStatusBarColorContext";
import wrapperScrollViewContext from "../contexts/wrapperScrollViewContext";

import useConfirmationModal from "../hooks/useConfirmationModal";
import useErrorModal from "../hooks/useErrorModal";

import Header from "./Header";
import { IconLoading } from "./Icons";
import Loading from "./Loading";
import SafeView from "./SafeView";

const interpolation = interpolate([Colors.white, Colors.primary]);
const Wrapper = ({ children, style, showHeader, navigation, scrollEnabled, hitBottom, refresh, loading, error, setError, confirmation, setConfirmation }) => {
	const [lastStatusBarColor, setLastStatusBarColor] = useContext(lastStatusBarColorContext);

	const insets = useSafeAreaInsets();

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
			<RefreshControl
				refreshing={refreshing}
				onRefresh={doRefresh}
				tintColor="transparent"
				colors={["transparent"]}
				progressBackgroundColor="transparent"
				progressViewOffset={-200}
				style={{ backgroundColor: "transparent" }}
			/>
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

	if (setError) {
		useEffect(() => {
			if (currentError !== error) setError(currentError);
		}, [currentError]);
	}

	const [currentConfirmation, setCurrentConfirmation, ConfirmationModal] = useConfirmationModal();

	useEffect(() => {
		if (confirmation !== currentConfirmation) setCurrentConfirmation(confirmation);
	}, [confirmation]);

	if (setConfirmation) {
		useEffect(() => {
			if (currentConfirmation !== confirmation) setConfirmation(currentConfirmation);
		}, [currentConfirmation]);
	}

	return (
		<SafeView style={styles.safeView}>
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
							marginTop: headerLayout.height + insets.top,
							height: Dimensions.get("screen").height - headerLayout.height * 2 - insets.top * 2,
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
							top: headerLayout.height + insets.top,
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
					</KeyboardAwareScrollView>
				)}
			</wrapperScrollViewContext.Provider>
			{ErrorModal}
			{ConfirmationModal}
		</SafeView>
	);
};

const styles = StyleSheet.create({
	safeView: {
		overflow: "visible",
	},
	wrapper: {
		flex: 1,
		marginHorizontal: 10,
	},
});

export default Wrapper;
