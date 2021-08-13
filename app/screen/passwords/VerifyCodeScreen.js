import React, { useContext, useEffect, useState } from "react";

import Form from "../../components/form/Form";
import FormButton from "../../components/form/FormButton";
import FormInput from "../../components/form/FormInput";
import { IconArrowBack } from "../../components/Icons";
import Wrapper from "../../components/Wrapper";

import dataContext from "../../contexts/dataContext";

import languagesUtils from "../../languages/utils";

import utils from "../../utils";

const verify = async (businessId, userId, code, setCurrentError, data) => {
	try {
		const res = await fetch(`http://192.168.178.25:8003/v1/users/recover/${businessId}/${userId}/${code}`, {
			method: "POST",
		}).then((res) => res.json());
		if (!res.success) {
			setCurrentError(
				languagesUtils.convertError(
					data.language,
					res,
					{
						businessId,
						userId,
						code,
					},
					"gebruiker",
					{
						businessId: "bedrijf",
						userId: "gebruiker",
						code: "code",
					}
				)
			);
		}
		return res.success;
	} catch (error) {
		utils.handleError(error);
		return false;
	}
};

const VerifyCodeScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);
	const [currentError, setCurrentError] = useState();

	const { code, userId, businessId } = route.params;
	const isCreating = route.params?.isCreating;

	const [currentCode, setCurrentCode] = useState(null);
	const [currentErrorLabel, setCurrentErrorLabel] = useState(null);

	useEffect(() => {
		if (code) {
			const validate = async () => {
				const valid = await verify(businessId, userId, code, setCurrentError, data);

				if (valid) {
					navigation.navigate("ChangePassword", { isCreating, userId, businessId, code });
				} else {
					setCurrentErrorLabel("De code is onjuist");
				}
			};
			validate();
		}
	}, [route.params]);
	return (
		<Wrapper showHeader={true} error={currentError}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord vergeten?"}>
				<FormInput label="Verificatie code" onChange={setCurrentCode} errorLabel={currentErrorLabel} />
				<FormButton
					onPress={async () => {
						if (await verify(businessId, userId, currentCode, setCurrentError, data)) {
							navigation.navigate("ChangePassword", { isCreating, userId, businessId, code: currentCode });
						} else {
							setCurrentErrorLabel("De code is onjuist");
						}
					}}
				>
					Verifieer
				</FormButton>
				<FormButton onPress={() => navigation.navigate("ForgotPassword")}>
					<IconArrowBack />
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default VerifyCodeScreen;
