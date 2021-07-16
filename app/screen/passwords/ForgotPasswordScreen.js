import React, { useEffect, useState } from "react";

import FormButton from "../../components/form/FormButton";
import Form from "../../components/form/Form";
import FormInput from "../../components/form/FormInput";
import Wrapper from "../../components/Wrapper";

import { IconArrowBack } from "../../components/Icons";
import useFormData from "../../hooks/useFormData";

const defaultFormData = [
	["business", "email"],
	[],
	[
		{
			key: "business",
			validator: (formData, text) => {
				if (!text) return "De bedrijfsnaam mag niet leeg zijn";
				if (text.length < 6) return "De bedrijfsnaam mag niet korter zijn dan 5 karakters";
				if (text.length > 255) return "De bedrijfsnaam mag niet langer zijn dan 255 karakters";
				return true;
			},
		},
		{
			key: "email",
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
	],
];

const createCode = async (business, email) => {
	try {
		const res = await fetch(`http://192.168.178.25:8003/v1/users/recover/${business}/${email}`).then((res) => res.json());
		if (!res.success) console.log(res);
		return res;
	} catch (err) {
		console.error(err);
		return { success: false };
	}
};

const ForgotPasswordScreen = ({ navigation, route }) => {
	const { code, userId, businessId } = route.params;
	const isCreating = route.params?.isCreating;

	useEffect(() => {
		if (code) {
			navigation.navigate("VerifyCode", { isCreating, userId, businessId, code });
		}
	}, [route.params]);

	const [currentErrorLabel, setCurrentErrorLabel] = useState(null);
	const [formData, setFormValue, getFormProps, validate] = useFormData(...defaultFormData);

	return (
		<Wrapper showHeader={true}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord vergeten?"} errorLabel={currentErrorLabel}>
				<FormInput label="Bedrijf" textContentType="name" {...getFormProps("business")} />
				<FormInput label="Email" textContentType="emailAddress" {...getFormProps("email")} />
				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentErrorLabel(valid.error);
							return;
						}

						try {
							const res = await createCode(formData.business.value, formData.email.value);
							if (!res.success) {
								return setCurrentErrorLabel("Account niet gevonden. Controleer de business naam en email address");
							}

							navigation.navigate("VerifyCode", { isCreating, userId: res.data.userId, businessId: res.data.businessId });
						} catch (error) {}
					}}
				>
					{isCreating ? "Verificatie code invullen" : "Verstuur verificatie code"}
				</FormButton>
				<FormButton onPress={() => navigation.navigate("Login")}>
					<IconArrowBack />
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default ForgotPasswordScreen;
