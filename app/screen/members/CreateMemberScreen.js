import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import Form from "../../components/form/Form";
import FormButton from "../../components/form/FormButton";
import FormDate from "../../components/form/FormDate";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

import useFormData from "../../hooks/useFormData";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const defaultFormData = [
	["firstname", "lastname", "born", "email", "function", "teams", "rightId"],
	[
		{
			key: "born",
			value: new Date(new Date().getFullYear() - 19, new Date().getMonth(), new Date().getDate()),
		},
	],
	[
		{
			key: "firstname",
			validator: (formData, data, text) => {
				if (!text) return "De voornaam mag niet leeg zijn";
				if (text.length < 3) return "De voornaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De voornaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "lastname",
			validator: (formData, data, text) => {
				if (!text) return "De achternaam mag niet leeg zijn";
				if (text.length < 3) return "De achternaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De achternaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "email",
			validator: (formData, data, text) => {
				if (!text) return "Het email address mag niet leeg zijn";
				if (
					!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
						text
					)
				)
					return "Het email address is incorrect";

				if (text.length > 255) return "Het email address mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "born",
			validator: (formData, data, currentDate) => {
				if (!currentDate) return "De geboorte datum mag niet leeg zijn";
				const ageDiffMilliseconds = Date.now() - currentDate.getTime();
				const ageDate = new Date(ageDiffMilliseconds);
				const age = Math.abs(ageDate.getUTCFullYear() - 1970);

				if (age < 18) return "U moet minimaal 18 jaar oud zijn";
				return true;
			},
		},
		{
			key: "function",
			validator: (formData, data, text) => {
				if (!text) return true;

				if (text.length > 255) return "De functie omschrijving mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
	],
];

const CreateMemberScreen = ({ navigation }) => {
	// TODO: test teams
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);
	const [currentError, setCurrentError] = useState(null);

	const [data, setData] = useContext(dataContext);

	const [rights, setRights] = useState([{ id: null, name: "Geen rechten" }]);

	// TODO: get from api
	const teams = [
		{ id: "1", name: "team" },
		{ id: "2", name: "team2" },
		{ id: "3", name: "team3" },
	];

	const getRights = async () => {
		if (!data.rights) data.rights = [];
		try {
			const res = await utils.fetchWithTimeout(config.api + "rights/business/" + data.user.business_id).then((res) => res.json());
			if (res.success) data.rights = res.data;
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	useEffect(() => {
		(async () => {
			// Get rights
			if (!data.rights || !Array.isArray(data.rights) || !(data.rights.length > 0)) {
				await getRights();
			}

			setRights([{ id: null, name: "Geen rechten" }, ...data.rights.map((x) => ({ id: x.id, name: x.name }))]);
		})();
	}, []);

	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Form title="Gebruiker toevoegen" errorLabel={currentError}>
				<FormInput label="Voornaam" textContentType="name" {...getFormProps("firstname")} />
				<FormInput label="Achternaam" textContentType="name" {...getFormProps("lastname")} />
				<FormInput label="Email" textContentType="emailAddress" keyboardType="email-address" {...getFormProps("email")} />
				<FormDate
					label="Geboorte datum"
					links={[
						{
							text: () => "1960",
							date: function () {
								return new Date("1960");
							},
						},
						{
							text: () => "1970",
							date: function () {
								return new Date("1970");
							},
						},
						{
							text: () => "1980",
							date: function () {
								return new Date("1980");
							},
						},
						{
							text: () => "1990",
							date: function () {
								return new Date("1990");
							},
						},
						{
							text: () => "2000",
							date: function () {
								return new Date("2000");
							},
						},
					]}
					{...getFormProps("born")}
				/>
				<FormInput label="Functie omschrijving" textContentType="jobTitle" {...getFormProps("function")} />
				<FormSelect label="Team(s)" multiple={true} defaultValue={["Geen team"]} data={teams.map((x) => x.name)} {...getFormProps("teams")} />
				<FormSelect label="Rechten" defaultValue={"Geen rechten"} data={rights.map((x) => x.name)} {...getFormProps("rightId")} />

				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentError(valid.error);
							return;
						}
						try {
							setCurrentError(null);

							// Create user
							const bodyUser = {
								businessId: data.user.business_id,
								firstName: formData.firstname.value,
								lastName: formData.lastname.value,
								email: formData.email.value,
								born: formData.born.value,
								rightId: rights.find((x) => x.name === formData.rightId.value)?.id,
								sendCreateCode: true,
							};

							if (formData.function.value) bodyUser.functionDescription = formData.function.value;

							const resUser = await utils
								.fetchWithTimeout(config.api + "users/", {
									method: "POST",
									headers: {
										Accept: "application/json",
										"Content-Type": "application/json",
									},
									body: JSON.stringify(bodyUser),
								})
								.then((res) => res.json());
							if (resUser.success) {
								// Add user to teams
								if (formData.teams.value) {
									for (let i = 0; i < formData.teams.value.length; i++) {
										const team = teams.find((x) => x.name === formData.teams.value[i]);
										if (!team) continue;

										// Add user to team
										const resTeam = await utils
											.fetchWithTimeout(config.api + "teams/" + team.id, {
												method: "POST",
												headers: {
													Accept: "application/json",
													"Content-Type": "application/json",
												},
												body: JSON.stringify({
													userId: resUser.data.id,
												}),
											})
											.then((res) => res.json());

										// Failed to add to team
										if (!resTeam.success) {
											// Display error
											setCurrentError(
												languagesUtils.convertError(data.language, resTeam, { userId: resUser.data.id }, "teams", {
													userId: "gebruiker",
												})
											);
											return;
										}
									}
								}

								// Go to and update members
								navigation.navigate("Members", { date: Date.now() });
							} else {
								// Display error
								setCurrentError(
									languagesUtils.convertError(data.language, resUser, bodyUser, "gebruiker", {
										firstName: "de voornaam",
										lastName: "de achternaam",
										email: "de email",
										born: "de geboorte datum",
										functionDescription: "de functie omschrijving",
									})
								);
							}
						} catch (error) {
							utils.handleError(error);
						}
					}}
				>
					Gebruiker toevoegen
				</FormButton>
			</Form>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	image: {
		borderRadius: 12,
		marginTop: 5,
		borderWidth: 2,
		borderColor: Colors.primary,
	},
});

export default CreateMemberScreen;
