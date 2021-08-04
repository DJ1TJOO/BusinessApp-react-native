import React, { useState, useContext, useEffect } from "react";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

import useFormData from "../hooks/useFormData";

import dataContext from "../contexts/dataContext";

import config from "../config/config";

import languagesUtils from "../languages/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
				if (data.login && data.login.businessNames && data.login.businessNames.length > 0 && !data.login.businessNames.includes(text))
					return `Het bedrijf '${text}' kan niet gevonden worden`;
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
			key: "password",
			validator: (formData, data, text) => {
				if (!text) return "Het wachtwoord mag niet leeg zijn";
				return true;
			},
		},
	],
];

const LoginScreen = ({ navigation }) => {
	const [currentError, setCurrentError] = useState(null);

	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);

	const [data, setData] = useContext(dataContext);

	useEffect(() => {
		// Get business names
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

		// Get token and user from storage
		(async () => {
			try {
				const token = await AsyncStorage.getItem("token");
				const user = JSON.parse(await AsyncStorage.getItem("user"));

				// If user is present
				if (user) {
					// Set default business and email
					setFormValues(["business_name", "email"], [user.business, user.email]);
				}

				// Token and user present
				if (token && user) {
					const res = await fetch(config.api + "login/validate", {
						method: "POST",
						headers: {
							Accept: "application/json",
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							token,
						}),
					}).then((res) => res.json());

					// Token valid, login
					if (res.success) {
						setData({
							...data,
							token,
							user,
						});

						navigation.navigate("Account");
					} else {
						// Token invalid reset storage
						await AsyncStorage.removeItem("token");
					}
				}
			} catch (error) {
				throw error;
			}
		})();
	}, []);

	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Form title="Login" errorLabel={currentError}>
				<FormInput label="Bedrijf" textContentType="name" {...getFormProps("business_name")} />
				<FormInput label="Email" textContentType="emailAddress" keyboardType="email-address" {...getFormProps("email")} />
				<FormInput
					label="Wachtwoord"
					helpLabel="Wachtwoord vergeten?"
					helpOnPress={() => navigation.navigate("ForgotPassword", { isCreating: false, businessId: null, userId: null, code: null })}
					hideText={true}
					{...getFormProps("password")}
				/>
				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentError(valid.error);
							return;
						}

						try {
							const res = await fetch(config.api + "login", {
								method: "POST",
								headers: {
									Accept: "application/json",
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									business: formData.business_name.value,
									email: formData.email.value,
									password: formData.password.value,
								}),
							}).then((res) => res.json());
							if (res.success) {
								setData({
									...data,
									token: res.data.token,
									user: res.data.user,
								});

								await AsyncStorage.setItem("token", res.data.token);
								await AsyncStorage.setItem(
									"user",
									JSON.stringify({
										...res.data.user,
										business: formData.business_name.value,
										email: formData.email.value,
									})
								);

								navigation.navigate("Account");
							} else {
								if (res.error === "business_not_found") {
									// Display error
									setCurrentError(languagesUtils.convertError(data.language, res));
								} else {
									setCurrentError("Het email address of wachtwoord is incorrect");
								}
							}
						} catch (error) {
							throw error;
						}
					}}
				>
					Login
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default LoginScreen;
