import React, { useContext, useState } from "react";

import Form from "../components/form/Form";
import FormButton from "../components/form/FormButton";
import FormInput from "../components/form/FormInput";
import Modal from "../components/Modal";
import Wrapper from "../components/Wrapper";

import config from "../config/config";

import dataContext from "../contexts/dataContext";

import useFormData from "../hooks/useFormData";
import useInfoModal from "../hooks/useInfoModal";

import languagesUtils from "../languages/utils";

import utils from "../utils";

const defaultFormData = (data) => [
	["email"],
	[{ key: "email", value: data.user.email }],
	[
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
	],
];

const SettingsScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);

	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData(data));
	const [currentError, setCurrentError] = useState(null);
	const [currentFormError, setCurrentFormError] = useState(null);

	const [currentConfirmation, setCurrentConfirmation] = useState(null);

	const [currentInfo, setCurrentInfo, InfoModal] = useInfoModal();

	return (
		<Wrapper showHeader={true} navigation={navigation} error={currentError} confirmation={currentConfirmation}>
			{InfoModal}
			<Form title="Instellingen" errorLabel={currentFormError}>
				<FormInput label="Email" textContentType="emailAddress" keyboardType="email-address" {...getFormProps("email")} />
				<FormButton
					onPress={async () => {
						// TODO: change password screen (with old password confirm)
					}}
				>
					Wachtwoord veranderen
				</FormButton>
				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentFormError(valid.error);
							return;
						}

						try {
							setCurrentFormError(null);

							if (formData.email.value !== data.user.email) {
								// Update user
								const bodyUser = {
									email: formData.email.value,
								};

								const resUser = await utils
									.fetchWithTimeout(config.api + "users/" + data.user.id, {
										method: "PATCH",
										headers: {
											Accept: "application/json",
											"Content-Type": "application/json",
										},
										body: JSON.stringify(bodyUser),
									})
									.then((res) => res.json());

								if (resUser.success) {
									data.user.email = formData.email.value;
									setData({ ...data });

									// Store in phone
									await AsyncStorage.setItem("user", JSON.stringify(data.user));
								} else {
									// Display error
									return setCurrentError(
										languagesUtils.convertError(data.language, resUser, bodyUser, "gebruiker", {
											email: "de email",
										})
									);
								}
							}

							setCurrentInfo("Instellingen geüpdate");
						} catch (error) {
							utils.handleError(error);
						}
					}}
				>
					Aanpassen
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default SettingsScreen;
