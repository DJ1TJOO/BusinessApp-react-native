import React from "react";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";
import FormHeading from "../components/form/FormHeading";
import FormDate from "../components/form/FormDate";

const RegisterScreen = () => {
	return (
		<Wrapper showHeader={true}>
			<Form title="Registeer bedrijf">
				<FormInput label="Bedrijfsnaam" />
				<FormHeading title="Hoofdaccount" />
				<FormInput label="Email" />
				<FormInput label="Wachtwoord" hideText={true} />
				<FormInput label="Bevestig wachtwoord" hideText={true} />
				<FormDate label="Geboorte datum" />
				<FormInput label="Functie omschrijving" />
				<FormButton invert={true}>Logo toevoegen</FormButton>
				<FormButton>Registeren</FormButton>
			</Form>
		</Wrapper>
	);
};

export default RegisterScreen;
