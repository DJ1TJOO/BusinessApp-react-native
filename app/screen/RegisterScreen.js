import * as ImagePicker from "expo-image-picker";
import React, { useContext, useState } from "react";
import { Alert, Image, Linking, StyleSheet } from "react-native";

import api from "../api";

import Form from "../components/form/Form";
import FormButton from "../components/form/FormButton";
import FormDate from "../components/form/FormDate";
import FormHeading from "../components/form/FormHeading";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

import Colors from "../config/Colors";

import dataContext from "../contexts/dataContext";

import useFormData from "../hooks/useFormData";

import languagesUtils from "../languages/utils";

import utils from "../utils";

const defaultFormData = [
	["businessName", "accountFirstname", "accountLastname", "accountBorn", "accountEmail", "accountPassword", "accountConfirmPassword", "accountFunction", "image"],
	[
		{
			key: "accountBorn",
			value: new Date(new Date().getFullYear() - 19, new Date().getMonth(), new Date().getDate()),
		},
	],
	[
		{
			key: "businessName",
			validator: (formData, data, text) => {
				if (!text) return "De bedrijfsnaam mag niet leeg zijn";
				if (text.length < 6) return "De bedrijfsnaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De bedrijfsnaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "accountFirstname",
			validator: (formData, data, text) => {
				if (!text) return "De voornaam mag niet leeg zijn";
				if (text.length < 3) return "De voornaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De voornaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "accountLastname",
			validator: (formData, data, text) => {
				if (!text) return "De achternaam mag niet leeg zijn";
				if (text.length < 3) return "De achternaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De achternaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "accountEmail",
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
			key: "accountPassword",
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
			key: "accountConfirmPassword",
			validator: (formData, data, text) => {
				if (!text) return "Het wachtwoord mag niet leeg zijn";
				if (text !== formData.accountPassword.value) return "Het wachtwoord moet het zelfde zijn ";
				return true;
			},
		},
		{
			key: "accountBorn",
			validator: (formData, data, currentDate) => {
				if (!currentDate) return "De geboorte datum mag niet leeg zijn";
				const ageDiffMilliseconds = Date.now() - currentDate.getTime();
				const ageDate = new Date(ageDiffMilliseconds);
				const age = Math.abs(ageDate.getUTCFullYear() - 1970);

				if (age < 18) return "U moet minimaal 18 jaar oud zijn";
				return true;
			},
		},
		{
			key: "accountFunction",
			validator: (formData, data, text) => {
				if (!text) return true;

				if (text.length > 255) return "De functie omschrijving mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "image",
			validator: (formData, data, image) => {
				if (!image) return "Selecteer een bedrijfs logo";
				if (image.size.width !== image.size.height) return "Het bedrijfs logo moet vierkant zijn";
				if (image.size.width > 300 || image.size.height > 300) return "Het bedrijfs logo is te groot, maximaal 300 pixels";
				if (image.size.width < 50 || image.size.height < 50) return "Het bedrijfs logo is te klein, minimaal 50 pixels";

				return true;
			},
		},
	],
];

const RegisterScreen = ({ navigation }) => {
	const [formLayout, setFormLayout] = useState(null);
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);
	const [currentError, setCurrentError] = useState(null);
	const [currentFormError, setCurrentFormError] = useState(null);

	const [isLogoSet, setIsLogoSet] = useState(false);

	const [data, setData] = useContext(dataContext);

	const pickImage = async () => {
		setIsLogoSet(true);

		let currentStatus = false;
		let tryAgain = true;
		while (currentStatus !== "granted" && tryAgain) {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			currentStatus = status;

			if (currentStatus !== "granted") {
				await new Promise((resolve) => {
					Alert.alert(
						"Toegang nodig",
						"Er is toegang tot foto's nodig om een foto te kunnen selecteren",
						[
							{
								text: "Toegang geven",
								onPress: () => {
									Linking.openSettings();
									resolve();
								},
								style: "default",
							},
							{
								text: "Anuleren",
								onPress: () => {
									tryAgain = false;
									resolve();
								},
								style: "destructive",
							},
						],
						{
							cancelable: false,
						}
					);
				});
			}
		}
		if (currentStatus !== "granted") {
			Alert.alert("Er is toegang tot foto's nodig om een foto te kunnen selecteren");
			setFormValue("image")(null, false);
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
			maxWidth: 100,
			maxHeight: 100,
			base64: true,
		});

		if (!result.cancelled) {
			const size = await new Promise((resolve, reject) => {
				Image.getSize(
					result.uri,
					(width, height) => resolve({ width, height }),
					(error) => reject(error)
				);
			});
			setFormValue("image")({ uri: result.uri, size: size, base64: result.base64 }, true);
		} else {
			setFormValue("image")(null, false);
		}
	};

	return (
		<Wrapper navigation={navigation} showHeader={true} error={currentError} setError={setCurrentError}>
			<Form title="Registeer bedrijf" onLayout={(e) => setFormLayout(e.nativeEvent.layout)} errorLabel={currentFormError}>
				<FormInput label="Bedrijfsnaam" textContentType="name" {...getFormProps("businessName")} />
				<FormHeading title="Hoofdaccount" />
				<FormInput label="Voornaam" textContentType="name" {...getFormProps("accountFirstname")} />
				<FormInput label="Achternaam" textContentType="name" {...getFormProps("accountLastname")} />
				<FormInput label="Email" textContentType="emailAddress" keyboardType="email-address" {...getFormProps("accountEmail")} />
				<FormInput label="Wachtwoord" hideText={true} textContentType="password" {...getFormProps("accountPassword")} />
				<FormInput label="Bevestig wachtwoord" hideText={true} textContentType="password" {...getFormProps("accountConfirmPassword")} />
				<FormDate
					label="Geboorte datum"
					links={[
						{
							text: () => "1960",
							date: function () {
								return new Date("1960");
							},
						},
						{
							text: () => "1970",
							date: function () {
								return new Date("1970");
							},
						},
						{
							text: () => "1980",
							date: function () {
								return new Date("1980");
							},
						},
						{
							text: () => "1990",
							date: function () {
								return new Date("1990");
							},
						},
						{
							text: () => "2000",
							date: function () {
								return new Date("2000");
							},
						},
					]}
					{...getFormProps("accountBorn")}
				/>
				<FormInput label="Functie omschrijving" textContentType="jobTitle" {...getFormProps("accountFunction")} />
				{formData.image.value && (
					<Image
						source={{ uri: formData.image.value.uri }}
						style={
							formData.image.value.size && formLayout
								? [styles.image, { width: formLayout.width, height: (formLayout.width / formData.image.value.size.width) * formData.image.value.size.height }]
								: styles.image
						}
						resizeMode="cover"
					/>
				)}

				<FormButton invert={true} bad={isLogoSet && !formData.image.value} onPress={pickImage}>
					{formData.image.value ? "Logo veranderen" : "Logo toevoegen"}
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

							const body = {
								name: formData.businessName.value,
								image: "data:image/png;base64," + formData.image.value.base64,
							};
							const res = await api
								.fetchToken("business/", {
									method: "POST",
									json: true,
									body: body,
								})
								.then((res) => res.json());
							// Business created
							if (res.success) {
								// Create user
								const bodyUser = {
									businessId: res.data.business.id,
									firstName: formData.accountFirstname.value,
									lastName: formData.accountLastname.value,
									email: formData.accountEmail.value,
									password: formData.accountPassword.value,
									born: formData.accountBorn.value,
									sendCreateCode: false,
								};

								if (formData.accountFunction.value) bodyUser.functionDescription = formData.accountFunction.value;

								const resUser = await api
									.fetchToken("users/", {
										method: "POST",
										json: true,
										body: bodyUser,
									})
									.then((res) => res.json());
								if (resUser.success) {
									// Make user owner of business
									const bodyBusiness = { ownerCode: res.data.ownerCode, owner: resUser.data.id };
									const resBusiness = await api
										.fetchToken("business/" + res.data.business.id, {
											method: "PATCH",
											json: true,
											body: bodyBusiness,
										})
										.then((res) => res.json());
									if (resBusiness.success) {
										navigation.navigate("Login");
									} else {
										// Display error
										setCurrentError(
											languagesUtils.convertError(data.language, resBusiness, bodyBusiness, "gebruiker", {
												ownerCode: "hoofdaccount code",
												owner: "hoofdaccount",
											})
										);
									}
								} else {
									// Display error
									setCurrentError(
										languagesUtils.convertError(data.language, resUser, bodyUser, "gebruiker", {
											firstName: "de voornaam",
											lastName: "de achternaam",
											email: "de email",
											password: "het wachtwoord",
											born: "de geboorte datum",
											functionDescription: "de functie omschrijving",
										})
									);
								}
							} else {
								// Display error
								setCurrentError(
									languagesUtils.convertError(data.language, res, body, "bedrijf", {
										name: "de bedrijfsnaam",
										image: "de afbeelding",
									})
								);
							}
						} catch (error) {
							utils.handleError(error);
						}
					}}
				>
					Registeren
				</FormButton>
			</Form>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	image: {
		borderRadius: 12,
		marginTop: 5,
		borderWidth: 2,
		borderColor: Colors.primary,
	},
});

export default RegisterScreen;
