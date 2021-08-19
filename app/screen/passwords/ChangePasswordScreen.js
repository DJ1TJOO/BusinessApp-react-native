import React, { useContext, useState } from "react";

import api from "../../api";

import Form from "../../components/form/Form";
import FormButton from "../../components/form/FormButton";
import FormInput from "../../components/form/FormInput";
import { IconArrowBack } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";

import dataContext from "../../contexts/dataContext";

import useFormData from "../../hooks/useFormData";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const defaultFormData = [
	["password", "confirm_password"],
	[],
	[
		{
			key: "password",
			validator: (formData, data, text) => {
				if (!text) return "Het wachtwoord mag niet leeg zijn";
				if (text.length < 8) return "Het wachtwoord mag niet korter zijn dan 8 karakters";
				if (text.length > 255) return "Het wachtwoord mag niet langer zijn dan 255 karakters";
				if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_-])(?=.{8,})/.test(text))
					return "Het wachtwoord moet minimaal:\n - 1 hoofdletter \n - 1 kleineletter\n - 1 speciaalteken \n - 1 nummer bevatten";
				return true;
			},
		},
		{
			key: "confirm_password",
			validator: (formData, data, text) => {
				if (!text) return "Het wachtwoord mag niet leeg zijn";
				if (text !== formData.password.value) return "Het wachtwoord moet het zelfde zijn ";
				return true;
			},
		},
	],
];

const updatePassword = async (businessId, userId, code, password, setCurrentError, data) => {
	try {
		const res = await api
			.fetchToken(`users/recover/${businessId}/${userId}/${code}`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					newPassword: password,
				}),
			})
			.then((res) => res.json());
		if (!res.success) {
			setCurrentError(
				languagesUtils.convertError(
					data.language,
					res,
					{
						newPassword: password,
					},
					"gebruiker",
					{
						newPassword: "nieuw wachtwoord",
					}
				)
			);
		}
		return res.success;
	} catch (error) {
		utils.handleError(error);
		return false;
	}
};

const ChangePasswordScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();

	const { code, userId, businessId } = route.params;
	const isCreating = route.params?.isCreating;

	const [currentFormError, setCurrentFormError] = useState(null);
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);
	return (
		<Wrapper showHeader={true} error={currentError} setError={setCurrentError}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord veranderen"} errorLabel={currentFormError}>
				<FormInput label={isCreating ? "Wachtwoord" : "Nieuw wachtwoord"} hideText={true} textContentType="password" {...getFormProps("password")} />
				<FormInput
					label={isCreating ? "Bevestig wachtwoord" : "Bevestig nieuw wachtwoord"}
					hideText={true}
					textContentType="password"
					{...getFormProps("confirm_password")}
				/>

				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentFormError(valid.error);
							return;
						}
						setCurrentFormError(null);

						try {
							if (await updatePassword(businessId, userId, code, formData.password.value, setCurrentError, data)) {
								navigation.navigate("Login");
							} else {
								setCurrentError("Er is iets misgegaan. Vraag een nieuwe code aan.");
							}
						} catch (error) {
							setCurrentError("Er is iets misgegaan. Vraag een nieuwe code aan.");
						}
					}}
				>
					{isCreating ? "Wachtwoord creëren" : "Wachtwoord veranderen"}
				</FormButton>
				<FormButton onPress={() => navigation.navigate("Login")}>
					<IconArrowBack />
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default ChangePasswordScreen;
