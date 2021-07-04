import React from "react";

import FormButton from "../../components/form/FormButton";
import Form from "../../components/form/Form";
import FormInput from "../../components/form/FormInput";
import Wrapper from "../../components/Wrapper";

const ForgotPasswordScreen = ({ navigation }) => {
	return (
		<Wrapper showHeader={true}>
			<Form title="Wachtwoord vergeten?">
				<FormInput label="Bedrijf" />
				<FormInput label="Email" />
				<FormButton onPress={() => navigation.navigate("VerifyCode")}>Verstuur verificatie code</FormButton>
				<FormButton onPress={() => navigation.navigate("Login")}>{FormButton.ArrowBack}</FormButton>
			</Form>
		</Wrapper>
	);
};

export default ForgotPasswordScreen;
