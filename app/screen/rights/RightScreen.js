import React from "react";
import { StyleSheet, Text } from "react-native";

import FormButton from "../../components/form/FormButton";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import config from "../../config/config";
import FontSizes from "../../config/FontSizes";

import languagesUtils from "../../languages/utils";

const RightScreen = ({ navigation, route }) => {
	return (
		<Wrapper showHeader={true} navigation={navigation}>
			<Heading
				icon={Heading.BACK_ICON}
				title={route.params?.name}
				onPress={() => {
					navigation.navigate("Rights");
				}}
			/>
			<Text style={styles.label}>Naam</Text>
			<Text style={styles.value}>{route.params?.name}</Text>

			<Text style={styles.label}>Rechten</Text>
			<Text style={styles.value}>
				{route.params?.rights.length < 1
					? "Geen rechten"
					: (() => {
							const rights = route.params?.rights.join(", ").replace(/.+(,.+)$/g, (a, b) => {
								const string = b.replace(/,/g, "en");
								return a.replace(b, " ") + string;
							});
							return rights;
					  })()}
			</Text>
			<FormButton onPress={() => navigation.navigate("ChangeRight", route.params)}>Aanpassen</FormButton>
			<FormButton
				bad={true}
				onPress={async () => {
					const res = await fetch(config.api + "rights/" + route.params.id, {
						method: "DELETE",
					}).then((res) => res.json());

					// Failed to delete
					if (!res.success) {
						// Display error
						setCurrentError(languagesUtils.convertError(data.language, res, {}, "rechten", {}));
						return;
					}

					navigation.navigate("Rights", { date: Date.now() });
				}}
			>
				Verwijderen
			</FormButton>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	label: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	value: {
		color: Colors.textSecondary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
		marginBottom: 10,
	},
});

export default RightScreen;
