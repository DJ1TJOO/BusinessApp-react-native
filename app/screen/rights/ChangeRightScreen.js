import React, { useContext, useEffect, useState } from "react";

import api from "../../api";

import Form from "../../components/form/Form";
import FormButton from "../../components/form/FormButton";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import dataContext from "../../contexts/dataContext";

import useFormData from "../../hooks/useFormData";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const defaultFormData = (params) => [
	["name", "rights"],
	[{ key: "name", value: params.name }],
	[
		{
			key: "name",
			validator: (formData, data, text) => {
				if (!text) return "De naam mag niet leeg zijn";
				if (text.length < 3) return "De naam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De naam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
	],
];

const ChangeRightScreen = ({ navigation, route }) => {
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData(route.params));
	const [currentError, setCurrentError] = useState(null);
	const [currentFormError, setCurrentFormError] = useState(null);

	const [data, setData] = useContext(dataContext);

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
			setFormValue("rights")(rights.filter((x) => route.params.rights.includes(x.id)).map((x) => x.name));
		})();
	}, []);

	const [currentConfirmation, setCurrentConfirmation] = useState(null);

	return (
		<Wrapper
			showHeader={true}
			navigation={navigation}
			error={currentError}
			confirmation={currentConfirmation}
			setError={setCurrentError}
			setConfirmation={setCurrentConfirmation}
		>
			<Form
				icon={Heading.BACK_ICON}
				title={route.params?.name}
				onPress={() => {
					navigation.navigate("Right", route.params);
				}}
				errorLabel={currentFormError}
			>
				<FormInput label="Naam" textContentType="name" {...getFormProps("name")} />
				<FormSelect label="Rechten" multiple={true} defaultValue={["Geen rechten"]} data={rights.map((x) => x.name)} {...getFormProps("rights")} />
				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentFormError(valid.error);
							return;
						}

						try {
							setCurrentFormError(null);

							let updatedRights = formData.rights.value.map((x) => rights.find((y) => y.name === x)?.id);

							// Update right
							const bodyRight = {
								name: formData.name.value !== route.params.name ? formData.name.value : undefined,
								rights: updatedRights !== route.params.rights ? updatedRights : undefined,
							};

							const resRight = await api
								.fetchToken("rights/" + route.params.id, {
									method: "PATCH",
									json: true,
									body: bodyRight,
								})
								.then((res) => res.json());

							if (resRight.success) {
								navigation.navigate("Rights", { date: Date.now() });
							} else {
								// Display error
								setCurrentError(
									languagesUtils.convertError(data.language, resRight, bodyRight, "rechten", {
										name: "de naam",
										rights: "de rechten",
									})
								);
							}
						} catch (error) {
							utils.handleError(error);
						}
					}}
				>
					Aanpassen
				</FormButton>
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
			</Form>
		</Wrapper>
	);
};

export default ChangeRightScreen;
