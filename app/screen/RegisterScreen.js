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

const RegisterScreen = () => {
	const [formLayout, setFormLayout] = useState(null);
	const [formData, setFormData] = useState({});

	const pickImage = async () => {
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
		<Wrapper showHeader={true}>
			<Form title="Registeer bedrijf" onLayout={(e) => setFormLayout(e.nativeEvent.layout)}>
				<FormInput label="Bedrijfsnaam" onChange={(e) => setFormData({ ...formData, business_name: e.nativeEvent.text })} />
				<FormHeading title="Hoofdaccount" />
				<FormInput
					label="Email"
					onChange={(e) =>
						setFormData({
							...formData,
							account_email: e.nativeEvent.text,
						})
					}
				/>
				<FormInput label="Wachtwoord" hideText={true} onChange={(e) => setFormData({ ...formData, account_password: e.nativeEvent.text })} />
				<FormInput label="Bevestig wachtwoord" hideText={true} onChange={(e) => setFormData({ ...formData, account_confirm_password: e.nativeEvent.text })} />
				<FormDate
					onChange={(currentDate) => setFormData({ ...formData, account_born: currentDate })}
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
				/>
				<FormInput label="Functie omschrijving" onChange={(e) => setFormData({ ...formData, account_function: e.nativeEvent.text })} />
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
				<FormButton invert={true} onPress={pickImage}>
					{formData.image ? "Logo veranderen" : "Logo toevoegen"}
				</FormButton>

				<FormButton
					onPress={() => {
						console.log(formData);
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
		borderColor: Colors.tertiary,
	},
});

export default RegisterScreen;
