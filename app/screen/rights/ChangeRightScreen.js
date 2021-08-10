import React, { useContext, useState } from "react";

import FormButton from "../../components/form/FormButton";
import FormDate from "../../components/form/FormDate";
import FormInput from "../../components/form/FormInput";
import FormSelect from "../../components/form/FormSelect";
import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";

import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

import useFormData from "../../hooks/useFormData";

const defaultFormData = (params) => [
	["name", "rights"],
	[
		{ key: "name", value: params.name },
		{ key: "rights", value: params.rights },
	],
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

	// TODO: get from api
	const rights = [
		{ id: "1", name: "right" },
		{ id: "2", name: "right2" },
		{ id: "3", name: "right3" },
	];

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

						// Update right
						const bodyRight = {
							name: formData.name.value !== route.params.name ? formData.name.value : undefined,
							rights: formData.rights.value !== route.params.rights ? formData.rights.value : undefined,
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
