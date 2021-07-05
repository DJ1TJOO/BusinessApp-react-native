import React from "react";

import FormButton from "../../components/form/FormButton";
import Form from "../../components/form/Form";
import FormInput from "../../components/form/FormInput";
import Wrapper from "../../components/Wrapper";

const VerifyCodeScreen = ({ navigation }) => {
	return (
		<Wrapper showHeader={true}>
			<Form title="Wachtwoord vergeten?">
				<FormInput label="Verificatie code" />
				<FormButton onPress={() => navigation.navigate("ChangePassword")}>Verifieer</FormButton>
				<FormButton onPress={() => navigation.navigate("ForgotPassword")}>
					<IconArrowBack />
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default VerifyCodeScreen;
