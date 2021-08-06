import React from "react";

import Wrapper from "../../components/Wrapper";
import Heading from "../../components/Heading";
import FormButton from "../../components/form/FormButton";
import FormInput from "../../components/form/FormInput";
import FormDate from "../../components/form/FormDate";
import FormSelect from "../../components/form/FormSelect";

const ChangeMemberScreen = ({ navigation, route }) => {
	// TODO: add functionality
	// TODO: get from api
	const teams = ["team", "team2", "team3"];
	const rights = ["Geen rechten", "right", "right2", "right3"];

	return (
		<Wrapper showHeader={true} navigation={navigation}>
			<Heading title={route.params?.firstname + " " + route.params?.lastname} />
			<FormInput label="Voornaam" value={route.params?.firstname} />
			<FormInput label="Achternaam" value={route.params?.lastname} />
			<FormInput label="Email" value={route.params?.email} />
			<FormDate label="Geboorte datum" value={new Date(route.params?.born)} />
			<FormInput label="Functie omschrijving" value={route.params?.function} />
			<FormSelect label="Team(s)" multiple={true} defaultValue={["Geen team"]} data={teams} value={route.params?.teams} />
			<FormSelect label="Rechten" defaultValue={"Geen rechten"} value={route.params?.rights} data={rights} />
			<FormButton>Aanpassen</FormButton>
		</Wrapper>
	);
};

export default ChangeMemberScreen;
