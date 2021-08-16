import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";

import Form from "../../components/form/Form";
import FormButton from "../../components/form/FormButton";
import FormInput from "../../components/form/FormInput";
import { IconArrowBack } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";

import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

import useFormData from "../../hooks/useFormData";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const defaultFormData = [
	["business", "email"],
	[],
	[
		{
			key: "business",
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
	],
];

export const createCode = async (business, email, setCurrentError, data) => {
	try {
		const res = await utils.fetchWithTimeout(`${config.api}users/recover/${business}/${email}`).then((res) => res.json());
		if (!res.success) {
			setCurrentError(languagesUtils.convertError(data.language, res));
		}
		return res;
	} catch (error) {
		utils.handleError(error);
		return { success: false };
	}
};

const ForgotPasswordScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();

	const { code, userId, businessId } = route.params;
	const isCreating = route.params?.isCreating;

	useEffect(() => {
		if (code) {
			navigation.navigate("VerifyCode", { isCreating, userId, businessId, code });
		}
	}, [route.params]);

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

		// Get user from storage or data
		(async () => {
			try {
				if (data.user) {
					// Set default business and email
					setFormValues(["business", "email"], [data.user.business, data.user.email]);
				} else {
					const user = JSON.parse(await AsyncStorage.getItem("user"));

					// If user is present
					if (user) {
						// Set default business and email
						setFormValues(["business", "email"], [user.business, user.email]);
					}
				}
			} catch (error) {
				throw error;
			}
		})();
	}, []);

	const [currentFormError, setCurrentFormError] = useState(null);
	const [formData, setFormValue, setFormValues, getFormProps, validate] = useFormData(...defaultFormData);

	return (
		<Wrapper showHeader={true} error={currentError}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord vergeten?"} errorLabel={currentFormError}>
				<FormInput label="Bedrijf" textContentType="name" {...getFormProps("business")} />
				<FormInput label="Email" textContentType="emailAddress" keyboardType="email-address" {...getFormProps("email")} />
				<FormButton
					onPress={async () => {
						const valid = validate();
						if (valid !== true) {
							setCurrentFormError(valid.error);
							return;
						}
						setCurrentFormError(null);

						try {
							const res = await createCode(formData.business.value, formData.email.value, setCurrentError, data);
							if (!res.success) {
								return setCurrentFormError("Account niet gevonden. Controleer de business naam en email address");
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
