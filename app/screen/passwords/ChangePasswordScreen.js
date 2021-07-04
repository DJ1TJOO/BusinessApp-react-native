import React from "react";

import FormButton from "../../components/form/FormButton";
import Form from "../../components/form/Form";
import FormInput from "../../components/form/FormInput";
import Wrapper from "../../components/Wrapper";

const ChangePasswordScreen = ({ navigation, isCreating }) => {
	return (
		<Wrapper showHeader={true}>
			<Form title={isCreating ? "Wachtwoord creëren" : "Wachtwoord veranderen"}>
				<FormInput label={isCreating ? "Wachtwoord" : "Nieuw wachtwoord"} hideText={true} />
				<FormInput label={isCreating ? "Bevestig wachtwoord" : "Bevestig nieuw wachtwoord"} hideText={true} />
				<FormButton onPress={() => navigation.navigate("Login")}>{isCreating ? "Wachtwoord creëren" : "Wachtwoord veranderen"}</FormButton>
				<FormButton onPress={() => navigation.navigate("Login")}>{FormButton.ArrowBack}</FormButton>
			</Form>
		</Wrapper>
	);
};

export default ChangePasswordScreen;
