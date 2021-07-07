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
				<FormDate
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
				<FormInput label="Functie omschrijving" />
				<FormButton invert={true}>Logo toevoegen</FormButton>
				<FormButton>Registeren</FormButton>
			</Form>
		</Wrapper>
	);
};

export default RegisterScreen;
