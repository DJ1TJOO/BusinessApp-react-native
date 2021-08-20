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

const MemberScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState(null);

	const getRights = async () => {
		if (!data.rights) data.rights = [];
		try {
			const res = await api.fetchToken("rights/business/" + data.user.businessId).then((res) => res.json());
			if (res.success) data.rights = res.data;
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	useEffect(() => {
		// Get rights
		if (!data.rights || !Array.isArray(data.rights) || !(data.rights.length > 0)) {
			getRights();
		}
	}, []);

	const [currentConfirmation, setCurrentConfirmation] = useState(null);

	return (
		<Wrapper
			showHeader={true}
			navigation={navigation}
			confirmation={currentConfirmation}
			error={currentError}
			setError={setCurrentError}
			setConfirmation={setCurrentConfirmation}
		>
			<Heading
				icon={Heading.BACK_ICON}
				title={route.params?.firstname + " " + route.params?.lastname}
				onPress={() => {
					navigation.navigate("Members");
				}}
			/>
			<Text style={styles.label}>Voornaam</Text>
			<Text style={styles.value}>{route.params?.firstname}</Text>
			<Text style={styles.label}>Achternaam</Text>
			<Text style={styles.value}>{route.params?.lastname}</Text>
			<Text style={styles.label}>Email</Text>
			<Text style={styles.value}>{route.params?.email}</Text>
			<Text style={styles.label}>Geboorte datum</Text>
			<Text style={styles.value}>{new Date(route.params?.born).toLocaleDateString()}</Text>
			<Text style={styles.label}>Functie omschrijving</Text>
			<Text style={styles.value}>{route.params?.function || "Geen functie"}</Text>
			<Text style={styles.label}>Team(s)</Text>
			<Text style={styles.value}>
				{route.params?.teams.length < 1
					? "Geen team"
					: (() => {
							const teams = route.params?.teams.join(", ").replace(/.+(,.+)$/g, (a, b) => {
								const string = b.replace(/,/g, "en");
								return a.replace(b, " ") + string;
							});
							return teams;
					  })()}
			</Text>
			<Text style={styles.label}>Rechten</Text>
			<Text style={styles.value}>{(data.rights && data.rights.find((x) => x.id === route.params?.rights)?.name) || "Geen rechten"}</Text>
			<FormButton onPress={() => navigation.navigate("ChangeMember", route.params)}>Aanpassen</FormButton>
			<FormButton
				bad={true}
				onPress={() => {
					setCurrentConfirmation({
						question: "Weet u zeker dat u de gebruiker '" + route.params?.firstname + " " + route.params?.lastname + "' wilt verwijderen?",
						buttons: {
							accept: "Verwijder",
							cancel: "Annuleer",
						},
						events: {
							onAccept: async () => {
								try {
									const res = await api
										.fetchToken("users/" + route.params.id, {
											method: "DELETE",
										})
										.then((res) => res.json());

									// Failed to delete
									if (!res.success) {
										// Display error
										setCurrentError(languagesUtils.convertError(data.language, res, {}, "gebruiker", {}));
										return;
									}

									// TODO: delete from all tables (ex: teams, chats)

									navigation.navigate("Members", { date: Date.now() });
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

export default MemberScreen;
