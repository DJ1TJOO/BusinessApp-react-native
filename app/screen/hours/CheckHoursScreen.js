import React, { useState, useContext, useEffect } from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import Wrapper from "../../components/Wrapper";
import MenuCard from "../../components/menu/MenuCard";

import dataContext from "../../contexts/dataContext";

import config from "../../config/config";

const CheckHoursScreen = ({ navigation }) => {
	const [currentError, setCurrentError] = useState(null);

	const [data, setData] = useContext(dataContext);

	useEffect(() => {
		// Get user names
		if (!data.checkHours) data.checkHours = {};
		(async () => {
			try {
				const res = await fetch(config.api + "users/business/" + data.user.businessId).then((res) => res.json());
				if (res.success) data.checkHours.users = res.data;
				else data.checkHours.users = [];
				setData({ ...data });
			} catch (error) {
				throw error;
			}
		})();
	}, []);

	// TODO: add loading
	return (
		<Wrapper navigation={navigation} showHeader={true} error={currentError}>
			<Heading title="Uren controleren" style={styles.heading} />
			{data.checkHours &&
				data.checkHours.users &&
				data.checkHours.users.map((user) => (
					<MenuCard
						key={user.id}
						title={user.first_name + " " + user.last_name}
						onPress={() => {
							navigation.navigate("CheckHoursPerson", { id: user.id });
						}}
					/>
				))}
		</Wrapper>
	);
};

export default CheckHoursScreen;

const styles = StyleSheet.create({});
