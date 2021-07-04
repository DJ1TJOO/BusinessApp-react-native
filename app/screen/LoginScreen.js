import React from "react";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

const LoginScreen = ({ navigation }) => {
	return (
		<Wrapper showHeader={true}>
			<Form title="Login">
				<FormInput label="Bedrijf" />
				<FormInput label="Email" />
				<FormInput label="Wachtwoord" helpLabel="Wachtwoord vergeten?" helpOnPress={() => navigation.navigate("ForgotPassword")} hideText={true} />
				<FormButton>Login</FormButton>
			</Form>
		</Wrapper>
	);
};

export default LoginScreen;
