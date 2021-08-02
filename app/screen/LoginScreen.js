import React, { useState, useContext, useEffect } from "react";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

import useFormData from "../hooks/useFormData";

import dataContext from "../contexts/dataContext";

import config from "../config/config";

const defaultFormData = [
	["business_name", "email", "password"],
	[],
	[
		{
			key: "business_name",
			validator: (formData, data, text) => {
				if (!text) return "De bedrijfsnaam mag niet leeg zijn";
				if (text.length < 6) return "De bedrijfsnaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De bedrijfsnaam mag niet langer zijn dan 255 karakters";
				if (data.login.businessNames.length > 0 && !data.login.businessNames.includes(text)) return `Het bedrijf '${text}' kan niet gevonden worden`;
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
	],
];

const LoginScreen = ({ navigation }) => {
	const [isInvalidUser, setIsInvalidUser] = useState(false);
	const [currentError, setCurrentError] = useState(null);

	const [formData, setFormValue, getFormProps, validate] = useFormData(...defaultFormData);

	const [data, setData] = useContext(dataContext);

	useEffect(() => {
		if (!data.login) data.login = {};
		if (!data.login.businessNames || data.login.businessNames.length < 1) {
			(async () => {
				try {
					const res = await fetch(config.api + "business/names").then((res) => res.json());
					if (res.success) data.login.businessNames = res.data;
					else data.login.businessNames = [];
				} catch (error) {
					throw error;
				}
			})();
		}
		setData({ ...data });
	}, []);

	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Form title="Login" errorLabel={currentError}>
				<FormInput label="Bedrijf" textContentType="name" {...getFormProps("business_name")} />
				<FormInput label="Email" textContentType="emailAddress" {...getFormProps("email")} />
				<FormInput
					label="Wachtwoord"
					helpLabel="Wachtwoord vergeten?"
					helpOnPress={() => navigation.navigate("ForgotPassword", { isCreating: false, businessId: null, userId: null, code: null })}
					hideText={true}
					{...getFormProps("password")}
				/>
				<FormButton
					onPress={() => {
						//TODO: check login
						const valid = validate();
						if (valid !== true) {
							setCurrentError(valid.error);
							return;
						}
						setCurrentError(null);
						//Het email address of wachtwoord is incorrect
						// setIsInvalidUser(true);
						// navigation.navigate("Account");
					}}
				>
					Login
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default LoginScreen;
