import React, { useContext, useEffect, useState } from "react";

import FormButton from "../../components/form/FormButton";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

import useFormData from "../../hooks/useFormData";

import languagesUtils from "../../languages/utils";

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
	// TODO: test
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData(route.params));
	const [currentError, setCurrentError] = useState(null);

	const [data, setData] = useContext(dataContext);

	const [rights, setRights] = useState([]);

	const getRights = async () => {
		if (!data.availableRights) data.availableRights = {};
		try {
			const res = await fetch(config.api + "rights/available").then((res) => res.json());
			if (res.success) data.availableRights = res.data;
			setData({ ...data });
		} catch (error) {
			throw error;
		}
	};

	useEffect(() => {
		(async () => {
			// Get rights
			if (!data.availableRights || Object.keys(data.availableRights) < 1) {
				await getRights();
			}

			const rights = Object.keys(data.availableRights).map((x) => ({ id: data.availableRights[x], name: languagesUtils.capitalizeFirstLetter(x.toLowerCase()) }));
			setRights(rights);
			setFormValue("rights")(rights.filter((x) => route.params.rights.includes(x.id)).map((x) => x.name));
		})();
	}, []);

	return (
		<Wrapper showHeader={true} navigation={navigation} error={currentError}>
			<Heading
				icon={Heading.BACK_ICON}
				title={route.params?.name}
				onPress={() => {
					navigation.navigate("Right", route.params);
				}}
			/>
			<FormInput label="Naam" textContentType="name" {...getFormProps("name")} />
			<FormSelect label="Rechten" multiple={true} defaultValue={["Geen rechten"]} data={rights.map((x) => x.name)} {...getFormProps("rights")} />
			<FormButton
				onPress={async () => {
					const valid = validate();
					if (valid !== true) {
						setCurrentError(valid.error);
						return;
					}

					try {
						setCurrentError(null);

						let updatedRights = formData.rights.value.map((x) => rights.find((y) => y.name === x)?.id);

						// Update right
						const bodyRight = {
							name: formData.name.value !== route.params.name ? formData.name.value : undefined,
							rights: updatedRights !== route.params.rights ? updatedRights : undefined,
						};

						const resRight = await fetch(config.api + "rights/" + route.params.id, {
							method: "PATCH",
							headers: {
								Accept: "application/json",
								"Content-Type": "application/json",
							},
							body: JSON.stringify(bodyRight),
						}).then((res) => res.json());

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
						throw error;
					}
				}}
			>
				Aanpassen
			</FormButton>
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

export default ChangeRightScreen;
