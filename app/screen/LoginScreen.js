import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";

import Form from "../components/form/Form";
import FormButton from "../components/form/FormButton";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

import config from "../config/config";

import dataContext from "../contexts/dataContext";

import useFormData from "../hooks/useFormData";

import languagesUtils from "../languages/utils";

import utils from "../utils";

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
	const [currentFormError, setCurrentFormError] = useState(null);

	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);

	const [data, setData] = useContext(dataContext);

	useEffect(() => {
		// Get business names
		if (!data.login) data.login = {};
		if (!data.login.businessNames || data.login.businessNames.length < 1) {
			(async () => {
				try {
					const res = await utils.fetchWithTimeout(config.api + "business/names").then((res) => res.json());
					if (res.success) data.login.businessNames = res.data;
					else data.login.businessNames = [];
				} catch (error) {
					utils.handleError(error);
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

				if (token && user) {
					const res = await utils
						.fetchWithTimeout(config.api + "login/validate", {
							method: "POST",
							headers: {
								Accept: "application/json",
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								token,
							}),
						})
						.then((res) => res.json());

					// Token valid, login
					if (res.success) {
						// Update in phone
						await AsyncStorage.setItem("token", res.data.token);
						if (res.data.user) {
							await AsyncStorage.setItem(
								"user",
								JSON.stringify({
									...res.data.user,
									business: user.business,
								})
							);
						}

						const businessRes = await utils.fetchWithTimeout(config.api + "business/" + user.business_id).then((res) => res.json());

						if (businessRes.success) {
							// Store in data
							setData({
								...data,
								token: res.data.token,
								user: { ...res.data.user, business: user.business } || user,
								business: businessRes.data,
							});

							navigation.navigate("Account");
						} else {
							setCurrentError(languagesUtils.convertError(data.language, businessRes));
						}
					} else {
						// Token invalid reset storage
						await AsyncStorage.removeItem("token");
					}
				}
			} catch (error) {
				utils.handleError(error);
			}
		})();
	}, []);

	return (
		<Wrapper navigation={navigation} showHeader={true} error={currentError}>
			<Form title="Login" errorLabel={currentFormError}>
				<FormInput label="Bedrijf" textContentType="name" {...getFormProps("business_name")} />
				<FormInput label="Email" textContentType="emailAddress" keyboardType="email-address" {...getFormProps("email")} />
				<FormInput
					label="Wachtwoord"
					helpLabel="Wachtwoord vergeten?"
					helpOnPress={() =>
						navigation.navigate("ForgotPassword", {
							isCreating: false,
							businessId: null,
							userId: null,
							code: null,
						})
					}
					hideText={true}
					{...getFormProps("password")}
				/>
				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentFormError(valid.error);
							return;
						}

						try {
							setCurrentFormError(null);

							const res = await utils
								.fetchWithTimeout(config.api + "login", {
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
								})
								.then((res) => res.json());
							if (res.success) {
								setFormValue("password")("", false);

								// Store in phone
								await AsyncStorage.setItem("token", res.data.token);
								await AsyncStorage.setItem(
									"user",
									JSON.stringify({
										...res.data.user,
										business: formData.business_name.value,
									})
								);

								const businessRes = await utils.fetchWithTimeout(config.api + "business/" + res.data.user.business_id).then((res) => res.json());

								if (businessRes.success) {
									// Store in data
									setData({
										...data,
										token: res.data.token,
										user: res.data.user,
										business: businessRes.data,
									});

									navigation.navigate("Account");
								} else {
									setCurrentError(languagesUtils.convertError(data.language, businessRes));
								}
							} else {
								if (res.error === "business_not_found") {
									// Display error
									setCurrentError(languagesUtils.convertError(data.language, res));
								} else {
									setCurrentFormError("Het email address of wachtwoord is incorrect");
								}
							}
						} catch (error) {
							utils.handleError(error);
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
