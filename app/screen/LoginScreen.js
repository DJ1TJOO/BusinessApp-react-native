import React, { useState } from "react";

import FormButton from "../components/form/FormButton";
import Form from "../components/form/Form";
import FormInput from "../components/form/FormInput";
import Wrapper from "../components/Wrapper";

const LoginScreen = ({ navigation }) => {
	const [isInvalidUser, setIsInvalidUser] = useState(false);

	return (
		<Wrapper navigation={navigation} showHeader={true}>
			<Form title="Login" errorLabel={isInvalidUser ? "Het email address of wachtwoord is incorrect" : null}>
				<FormInput
					label="Bedrijf"
					textContentType="name"
					validate={(text) => {
						//TODO: get business names
						const names = ["Business name"];
						if (!names.includes(text)) return `Het bedrijf '${text}' kan niet gevonden worden`;
						return true;
					}}
				/>
				<FormInput
					label="Email"
					textContentType="emailAddress"
					validate={(text) => {
						if (
							!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
								text
							)
						)
							return "Het email address is incorrect";

						return true;
					}}
					valid={isInvalidUser ? false : null}
				/>
				<FormInput
					label="Wachtwoord"
					helpLabel="Wachtwoord vergeten?"
					helpOnPress={() => navigation.navigate("ForgotPassword")}
					hideText={true}
					valid={isInvalidUser ? false : null}
				/>
				<FormButton
					onPress={() => {
						//TODO: check login
						setIsInvalidUser(true);
						navigation.navigate("Account");
					}}
				>
					Login
				</FormButton>
			</Form>
		</Wrapper>
	);
};

export default LoginScreen;
