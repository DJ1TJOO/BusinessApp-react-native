import React, { useState } from "react";
import { Alert, Image, Linking, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";
import FormHeading from "../components/form/FormHeading";
import FormDate from "../components/form/FormDate";

import Colors from "../config/Colors";

import useFormData from "../hooks/useFormData";

const defaultFormData = [
	["business_name", "account_firstname", "account_lastname", "account_born", "account_email", "account_password", "account_confirm_password", "account_function", "image"],
	[
		{
			key: "account_born",
			value: new Date(new Date().getFullYear() - 19, new Date().getMonth(), new Date().getDate()),
		},
	],
	[
		{
			key: "business_name",
			validator: (formData, text) => {
				if (!text) return "De bedrijfsnaam mag niet leeg zijn";
				if (text.length < 6) return "De bedrijfsnaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De bedrijfsnaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "account_firstname",
			validator: (formData, text) => {
				if (!text) return "De voornaam mag niet leeg zijn";
				if (text.length < 3) return "De voornaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De voornaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "account_lastname",
			validator: (formData, text) => {
				if (!text) return "De achternaam mag niet leeg zijn";
				if (text.length < 3) return "De achternaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De achternaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "account_email",
			validator: (formData, text) => {
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
			key: "account_password",
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
			key: "account_confirm_password",
			validator: (formData, text) => {
				if (!text) return "Het wachtwoord mag niet leeg zijn";
				if (text !== formData.account_password.value) return "Het wachtwoord moet het zelfde zijn ";
				return true;
			},
		},
		{
			key: "account_born",
			validator: (formData, currentDate) => {
				if (!currentDate) return "De geboorte datum mag niet leeg zijn";
				const ageDiffMilliseconds = Date.now() - currentDate.getTime();
				const ageDate = new Date(ageDiffMilliseconds);
				const age = Math.abs(ageDate.getUTCFullYear() - 1970);

				if (age < 18) return "U moet minimaal 18 jaar oud zijn";
				return true;
			},
		},
		{
			key: "account_function",
			validator: (formData, text) => {
				if (text.length > 255) return "De functie omschrijving mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
	],
];

const RegisterScreen = ({ navigation }) => {
	const [formLayout, setFormLayout] = useState(null);
	const [formData, setFormValue, getFormProps, validate] = useFormData(...defaultFormData);
	const [currentError, setCurrentError] = useState(null);
	const [isLogoSet, setIsLogoSet] = useState(false);

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
		});

		if (!result.cancelled) {
			const size = await new Promise((resolve, reject) => {
				Image.getSize(
					result.uri,
					(width, height) => resolve({ width, height }),
					(error) => reject(error)
				);
			});
			setFormValue("image")({ uri: result.uri, size: size }, true);
		} else {
			setFormValue("image")(null, false);
		}
	};

	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Form title="Registeer bedrijf" onLayout={(e) => setFormLayout(e.nativeEvent.layout)} errorLabel={currentError}>
				<FormInput label="Bedrijfsnaam" textContentType="name" {...getFormProps("business_name")} />
				<FormHeading title="Hoofdaccount" />
				<FormInput label="Voornaam" textContentType="name" {...getFormProps("account_firstname")} />
				<FormInput label="Achternaam" textContentType="name" {...getFormProps("account_lastname")} />
				<FormInput label="Email" textContentType="emailAddress" {...getFormProps("account_email")} />
				<FormInput label="Wachtwoord" hideText={true} textContentType="password" {...getFormProps("account_password")} />
				<FormInput label="Bevestig wachtwoord" hideText={true} textContentType="password" {...getFormProps("account_confirm_password")} />
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
					{...getFormProps("account_born")}
				/>
				<FormInput label="Functie omschrijving" textContentType="jobTitle" {...getFormProps("account_function")} />
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
					onPress={() => {
						//TODO: Registeren
						const valid = validate();
						if (valid !== true) {
							setCurrentError(valid.error);
							return;
						}

						console.log("image check");
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
