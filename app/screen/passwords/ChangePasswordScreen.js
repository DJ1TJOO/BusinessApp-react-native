import React, { useState } from "react";

import FormButton from "../../components/form/FormButton";
import Form from "../../components/form/Form";
import FormInput from "../../components/form/FormInput";
import Wrapper from "../../components/Wrapper";

import { IconArrowBack } from "../../components/Icons";
import useFormData from "../../hooks/useFormData";

const defaultFormData = [
	["password", "confirm_password"],
	[],
	[
		{
			key: "password",
			validator: (formData, text) => {
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
			validator: (formData, text) => {
				if (!text) return "Het wachtwoord mag niet leeg zijn";
				if (text !== formData.password.value) return "Het wachtwoord moet het zelfde zijn ";
				return true;
			},
		},
	],
];

const updatePassword = async (businessId, userId, code, password) => {
	try {
		const res = await fetch(`http://192.168.178.25:8003/v1/users/recover/${businessId}/${userId}/${code}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				newPassword: password,
			}),
		}).then((res) => res.json());
		if (!res.success) console.log(res);
		return res.success;
	} catch (err) {
		console.error(err);
		return false;
	}
};

const ChangePasswordScreen = ({ navigation, route }) => {
	const { code, userId, businessId } = route.params;
	const isCreating = route.params?.isCreating;

	const [currentErrorLabel, setCurrentErrorLabel] = useState(null);
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);
	return (
		<Wrapper showHeader={true}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord veranderen"} errorLabel={currentErrorLabel}>
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
							setCurrentErrorLabel(valid.error);
							return;
						}

						try {
							if (await updatePassword(businessId, userId, code, formData.password.value)) {
								navigation.navigate("Login");
							} else {
								setCurrentErrorLabel("Er is iets misgegaan. Vraag een nieuwe code aan.");
							}
						} catch (error) {
							setCurrentErrorLabel("Er is iets misgegaan. Vraag een nieuwe code aan.");
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
