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

import utils from "../../utils";

const defaultFormData = [
	["name", "rights"],
	[],
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

const CreateRightScreen = ({ navigation, route }) => {
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);
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
			utils.handleError(error);
		}
	};

	useEffect(() => {
		(async () => {
			// Get rights
			if (!data.availableRights || Object.keys(data.availableRights) < 1) {
				await getRights();
			}

			setRights(Object.keys(data.availableRights).map((x) => ({ id: data.availableRights[x], name: languagesUtils.capitalizeFirstLetter(x.toLowerCase()) })));
		})();
	}, []);

	return (
		<Wrapper showHeader={true} navigation={navigation} error={currentError}>
			<Heading title="Recht toevoegen" />
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

						// Create right
						const bodyRight = {
							businessId: data.user.business_id,
							name: formData.name.value,
							rights: formData.rights.value.map((x) => rights.find((y) => y.name === x)?.id),
						};

						const resRight = await fetch(config.api + "rights/", {
							method: "POST",
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
						utils.handleError(error);
					}
				}}
			>
				Recht toevoegen
			</FormButton>
		</Wrapper>
	);
};

export default CreateRightScreen;
