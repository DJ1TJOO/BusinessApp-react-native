import React, { useState, useEffect } from "react";

import FormButton from "../../components/form/FormButton";
import Form from "../../components/form/Form";
import FormInput from "../../components/form/FormInput";
import Wrapper from "../../components/Wrapper";

import { IconArrowBack } from "../../components/Icons";

const verify = async (businessId, userId, code) => {
	try {
		const res = await fetch(`http://192.168.178.25:8003/v1/users/recover/${businessId}/${userId}/${code}`, {
			method: "POST",
		}).then((res) => res.json());
		if (!res.success) console.log(res);
		return res.success;
	} catch (err) {
		console.error(err);
		return false;
	}
};

const VerifyCodeScreen = ({ navigation, route }) => {
	const { code, userId, businessId } = route.params;
	const isCreating = route.params?.isCreating;

	const [currentCode, setCurrentCode] = useState(null);
	const [currentErrorLabel, setCurrentErrorLabel] = useState(null);

	useEffect(() => {
		if (code) {
			const validate = async () => {
				const valid = await verify(businessId, userId, code);

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
		<Wrapper showHeader={true}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord vergeten?"}>
				<FormInput label="Verificatie code" onChange={setCurrentCode} errorLabel={currentErrorLabel} />
				<FormButton
					onPress={async () => {
						if (await verify(businessId, userId, currentCode)) {
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
