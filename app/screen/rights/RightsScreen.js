import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Card from "../../components/Card";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import config from "../../config/config";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

import utils from "../../utils";

const RightsScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();

	const getRights = async () => {
		if (!data.rights) data.rights = [];
		try {
			const res = await fetch(config.api + "rights/business/" + data.user.business_id).then((res) => res.json());
			if (res.success) data.rights = res.data;
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	useEffect(() => {
		// Get rights
		getRights();
	}, [route]);

	// TODO: add loading
	return (
		<Wrapper showHeader={true} navigation={navigation} error={currentError} refresh={getRights}>
			<Heading title="Alle rechten" />
			{data.rights &&
				data.rights.length > 0 &&
				data.rights.map((right, index) => (
					<Card
						key={index}
						onPress={() => {
							navigation.navigate("Right", right);
						}}
					>
						<View style={styles.row}>
							<Text style={styles.name}>{right.name}</Text>
						</View>
					</Card>
				))}
			{data.rights && data.rights.length < 1 && <Text style={styles.info}>Geen rechten</Text>}
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	name: {
		color: Colors.textPrimary,
		fontSize: FontSizes.title,
		fontFamily: "Segoe-UI",
		alignSelf: "center",
	},
	info: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	row: {
		flexDirection: "row",
		alignContent: "center",
		flex: 1,
		flexWrap: "wrap",
	},
});
export default RightsScreen;
