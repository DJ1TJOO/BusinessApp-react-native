import React from "react";
import { StyleSheet, Text } from "react-native";

import Wrapper from "../components/Wrapper";

const HomeScreen = ({ navigation }) => {
	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Text style={{ color: "red" }}>Home</Text>
		</Wrapper>
	);
};

const styles = StyleSheet.create({});

export default HomeScreen;
