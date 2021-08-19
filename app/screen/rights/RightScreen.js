import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import api from "../../api";

import FormButton from "../../components/form/FormButton";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const RightScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState(null);

	const [rights, setRights] = useState([]);

	const getRights = async () => {
		if (!data.availableRights) data.availableRights = {};
		try {
			const res = await api.fetchToken("rights/available").then((res) => res.json());
			if (res.success) data.availableRights = res.data;
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	useEffect(() => {
		(async () => {
			// Get rights
			if (!data.availableRights || Object.keys(data.availableRights) < 1) {
				await getRights();
			}

			const rights = Object.keys(data.availableRights).map((x) => ({
				id: data.availableRights[x],
				name: languagesUtils.capitalizeFirstLetter(x.toLowerCase().replace(/_/, " ")),
			}));
			setRights(rights);
		})();
	}, []);

	const [currentConfirmation, setCurrentConfirmation] = useState(null);

	return (
		<Wrapper showHeader={true} navigation={navigation} confirmation={currentConfirmation} error={currentError}>
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
				{!rights || rights.length < 1 || route.params?.rights.length < 1
					? "Geen rechten"
					: rights
							.filter((x) => route.params.rights.includes(x.id))
							.map((x) => x.name)
							.join(", ")
							.replace(/.+(,.+)$/g, (a, b) => {
								const string = b.replace(/,/g, "en");
								return a.replace(b, " ") + string;
							})}
			</Text>
			<FormButton onPress={() => navigation.navigate("ChangeRight", route.params)}>Aanpassen</FormButton>
			<FormButton
				bad={true}
				onPress={() => {
					setCurrentConfirmation({
						question: "Weet u zeker dat u het recht '" + route.params?.name + "' wilt verwijderen?",
						buttons: {
							accept: "Verwijder",
							cancel: "Annuleer",
						},
						events: {
							onAccept: async () => {
								try {
									const res = await api
										.fetchToken("rights/" + route.params.id, {
											method: "DELETE",
										})
										.then((res) => res.json());

									// Failed to delete
									if (!res.success) {
										// Display error
										setCurrentError(languagesUtils.convertError(data.language, res, {}, "rechten", {}));
										return;
									}

									navigation.navigate("Rights", { date: Date.now() });
								} catch (error) {
									utils.handleError(error);
								}
							},
							onCancel: () => {},
						},
					});
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
