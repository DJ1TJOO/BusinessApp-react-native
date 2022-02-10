import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";

import api from "../api";

import Form from "../components/form/Form";
import FormButton from "../components/form/FormButton";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

import dataContext from "../contexts/dataContext";

import useFormData from "../hooks/useFormData";

import languagesUtils from "../languages/utils";

import utils from "../utils";

const defaultFormData = [
	["businessName", "email", "password"],
	[],
	[
		{
			key: "businessName",
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
					const res = await api.fetchToken("business/names").then((res) => res.json());
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
					setFormValues(["businessName", "email"], [user.business, user.email]);
				}

				if (token && user) {
					const res = await api
						.fetchToken("login/validate", {
							method: "POST",
							json: true,
							body: {
								token,
							},
						})
						.then((res) => res.json());

					// Token valid, login
					if (res.success) {
						// Update in phone
						await AsyncStorage.setItem("token", res.data.token);
						if (res.data.user) {
							// Update notification token
							if (res.data.user.notificationToken !== data.notificationToken) {
								const resToken = await api
									.fetchToken("users/" + res.data.user.id, {
										method: "PATCH",
										json: true,
										body: {
											notificationToken: data.notificationToken,
										},
									})
									.then((res) => res.json());

								if (!resToken.success) {
									setCurrentError(
										languagesUtils.convertError(
											data.language,
											resToken,
											{
												notificationToken: data.notificationToken,
											},
											"gebruiker",
											{
												notificationToken: "de meldingstoken",
											}
										)
									);
								}
							}

							await AsyncStorage.setItem(
								"user",
								JSON.stringify({
									...res.data.user,
									business: user.business,
								})
							);
						}

						const businessRes = await api.fetchToken("business/" + user.businessId).then((res) => res.json());

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
		<Wrapper navigation={navigation} showHeader={true} error={currentError} setError={setCurrentError}>
			<Form title="Login" errorLabel={currentFormError}>
				<FormInput label="Bedrijf" textContentType="name" {...getFormProps("businessName")} />
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

							const res = await api
								.fetchToken("login", {
									method: "POST",
									json: true,
									body: {
										business: formData.businessName.value,
										email: formData.email.value,
										password: formData.password.value,
									},
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
										business: formData.businessName.value,
									})
								);

								// Update notification token
								if (res.data.user.notificationToken !== data.notificationToken) {
									const resToken = await api
										.fetchToken("users/" + res.data.user.id, {
											method: "PATCH",
											json: true,
											body: {
												notificationToken: data.notificationToken,
											},
										})
										.then((res) => res.json());

									if (!resToken.success) {
										setCurrentError(
											languagesUtils.convertError(
												data.language,
												resToken,
												{
													notificationToken: data.notificationToken,
												},
												"gebruiker",
												{
													notificationToken: "de meldingstoken",
												}
											)
										);
									}
								}

								const businessRes = await api.fetchToken("business/" + res.data.user.businessId).then((res) => res.json());

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
									console.log(res.error);
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
