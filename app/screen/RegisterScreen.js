import React, { useState, useRef, forwardRef } from "react";
import { Alert, Image, Linking, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";
import FormHeading from "../components/form/FormHeading";
import FormDate from "../components/form/FormDate";
import Colors from "../config/Colors";

const validators = {
	business_name: (formData, text) => {
		if (text.length < 6) return "De bedrijfsnaam mag niet korter zijn dan 5 karakters";
		if (text.length > 255) return "De bedrijfsnaam mag niet langer zijn dan 255 karakters";
		return true;
	},
	firstname: (formData, text) => {
		if (text.length < 6) return "De voornaam mag niet korter zijn dan 5 karakters";
		if (text.length > 255) return "De voornaam mag niet langer zijn dan 255 karakters";
		return true;
	},
	lastname: (formData, text) => {
		if (text.length < 6) return "De achternaam mag niet korter zijn dan 5 karakters";
		if (text.length > 255) return "De achternaam mag niet langer zijn dan 255 karakters";
		return true;
	},
	account_email: (formData, text) => {
		if (
			!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
				text
			)
		)
			return "Het email address is incorrect";

		if (text.length > 255) return "Het email address mag niet langer zijn dan 255 karakters";
		return true;
	},
	account_password: (formData, text) => {
		if (text.length < 9) return "Het wachtwoord mag niet korter zijn dan 8 karakters";
		if (text.length > 255) return "Het wachtwoord mag niet langer zijn dan 255 karakters";
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_-])(?=.{8,})/.test(text))
			return "Het wachtwoord moet minimaal:\n - 1 hoofdletter \n - 1 kleineletter\n - 1 speciaalteken \n - 1 nummer bevatten";
		return true;
	},
	account_confirm_password: (formData, text) => {
		console.log(formData);
		if (text !== formData.account_password) return "Het wachtwoord moet het zelfde zijn ";
		return true;
	},
	account_born: (formData, currentDate) => {
		const ageDiffMilliseconds = Date.now() - currentDate.getTime();
		const ageDate = new Date(ageDiffMilliseconds);
		const age = Math.abs(ageDate.getUTCFullYear() - 1970);

		if (age < 18) return "U moet minimaal 18 jaar oud zijn";
		return true;
	},
	account_function: (formData, text) => {
		if (text.length > 255) return "De functie omschrijving mag niet langer zijn dan 255 karakters";
		return true;
	},
};

const RegisterScreen = ({ navigation }) => {
	const [formLayout, setFormLayout] = useState(null);
	const [formData, setFormData] = useState({
		business_name: "",
		account_firstname: "",
		account_lastname: "",
		account_email: "",
		account_password: "",
		account_confirm_password: "",
		account_born: new Date(),
		account_function: "",
	});
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
			setFormData({ ...formData, image: { uri: result.uri, size: size } });
		}
	};

	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Form title="Registeer bedrijf" onLayout={(e) => setFormLayout(e.nativeEvent.layout)}>
				<FormInput
					label="Bedrijfsnaam"
					onChange={(text) => setFormData({ ...formData, business_name: text })}
					textContentType="name"
					validate={validators.business_name.bind(undefined, formData)}
				/>
				<FormHeading title="Hoofdaccount" />
				<FormInput
					label="Voornaam"
					onChange={(text) => setFormData({ ...formData, firstname: text })}
					textContentType="name"
					validate={validators.firstname.bind(undefined, formData)}
				/>
				<FormInput
					label="Achternaam"
					onChange={(text) => setFormData({ ...formData, lastname: text })}
					textContentType="name"
					validate={validators.lastname.bind(undefined, formData)}
				/>
				<FormInput
					label="Email"
					onChange={(text) =>
						setFormData({
							...formData,
							account_email: text,
						})
					}
					textContentType="emailAddress"
					validate={validators.account_email.bind(undefined, formData)}
				/>
				<FormInput
					label="Wachtwoord"
					hideText={true}
					onChange={(text) => setFormData({ ...formData, account_password: text })}
					textContentType="password"
					validate={validators.account_password.bind(undefined, formData)}
				/>
				<FormInput
					label="Bevestig wachtwoord"
					hideText={true}
					onChange={(text) => setFormData({ ...formData, account_confirm_password: text })}
					textContentType="password"
					validate={validators.account_confirm_password.bind(undefined, formData)}
				/>
				<FormDate
					onChange={(currentDate) => setFormData({ ...formData, account_born: currentDate })}
					validate={validators.account_born.bind(undefined, formData)}
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
					date={new Date(new Date().getFullYear() - 19, new Date().getMonth(), new Date().getDate())}
				/>
				<FormInput
					label="Functie omschrijving"
					onChange={(text) => setFormData({ ...formData, account_function: text })}
					textContentType="jobTitle"
					validate={validators.account_function.bind(undefined, formData)}
				/>
				{formData.image && (
					<Image
						source={{ uri: formData.image.uri }}
						style={
							formData.image.size && formLayout
								? [styles.image, { width: formLayout.width, height: (formLayout.width / formData.image.size.width) * formData.image.size.height }]
								: styles.image
						}
						resizeMode="cover"
					/>
				)}

				<FormButton invert={true} bad={isLogoSet && !formData.image} onPress={pickImage}>
					{formData.image ? "Logo veranderen" : "Logo toevoegen"}
				</FormButton>

				<FormButton
					onPress={() => {
						//TODO: register
						for (const key in formData) {
							console.log(key);
							if (validators.hasOwnProperty(key)) {
								const value = validators[key].bind(undefined, formData)(formData[key]);
								if (value !== true) return;
							}
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
