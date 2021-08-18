import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import FormButton from "../../components/form/FormButton";
import Heading from "../../components/Heading";
import { IconArrowBack, IconCheck, IconCross } from "../../components/Icons";
import MenuCard from "../../components/menu/MenuCard";
import Wrapper from "../../components/Wrapper";

import Colors from "../../config/Colors";
import { config } from "../../config/config";
import FontSizes from "../../config/FontSizes";

import dataContext from "../../contexts/dataContext";

import utils from "../../utils";

const CheckHoursPersonScreen = ({ navigation, route }) => {
	const [data, setData] = useContext(dataContext);

	const [hours, setHours] = useState([]);

	const getHours = async () => {
		try {
			const user = data.checkHours.users.find((x) => x.id === route.params.id);
			if (!user) return;
			const res = await utils.fetchToken(config.api + "hours/users/" + user.id).then((res) => res.json());
			if (res.success) user.hours = res.data.filter((x) => x.submitted !== null);
			else user.hours = [];
			setHours(user.hours);
			setData({ ...data });
		} catch (error) {
			utils.handleError(error);
		}
	};

	// Update user id
	useEffect(() => {
		getHours();
	}, [route]);

	return (
		<Wrapper
			navigation={navigation}
			showHeader={true}
			refresh={getHours}
			loading={
				!data.checkHours ||
				!data.checkHours.users ||
				!data.checkHours.users.find((x) => x.id === route.params.id) ||
				!data.checkHours.users.find((x) => x.id === route.params.id).hours
			}
		>
			<Heading title="Uren" style={styles.heading} />
			{hours.length > 0 &&
				hours.map((x, index) => (
					<MenuCard
						key={index}
						title={`Uren week ${x.week} (${x.year})`}
						icon={x.valid === true ? <IconCheck style={styles.icon}></IconCheck> : x.valid === false ? <IconCross style={styles.icon}></IconCross> : null}
						onPress={() => {
							navigation.navigate("CheckHoursWeek", { id: route.params.id, week: x.week, year: x.year });
						}}
					/>
				))}
			{hours.length < 1 && <Text style={styles.noHours}>Geen uren ingeleverd</Text>}
			<FormButton
				onPress={() => {
					navigation.navigate("CheckHours");
				}}
			>
				<IconArrowBack />
			</FormButton>
		</Wrapper>
	);
};

const styles = StyleSheet.create({
	noHours: {
		color: Colors.textPrimary,
		fontSize: FontSizes.subtitle,
		fontFamily: "Segoe-UI",
	},
	icon: {
		width: 30,
		height: 30,
		marginLeft: 5,
		marginTop: -2,
		top: 0,
	},
});

export default CheckHoursPersonScreen;
