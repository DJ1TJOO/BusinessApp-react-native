import React, { useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import Heading from "../../components/Heading";
import MenuCard from "../../components/menu/MenuCard";
import Wrapper from "../../components/Wrapper";

import config from "../../config/config";

import dataContext from "../../contexts/dataContext";

import utils from "../../utils";

const CheckHoursScreen = ({ navigation }) => {
	const [currentError, setCurrentError] = useState(null);

	const [data, setData] = useContext(dataContext);

	useEffect(() => {
		// Get user names
		if (!data.checkHours) data.checkHours = {};

		(async () => {
			try {
				const res = await fetch(config.api + "users/business/" + data.user.business_id).then((res) => res.json());
				if (res.success) data.checkHours.users = res.data;
				else data.checkHours.users = [];
				setData({ ...data });
			} catch (error) {
				utils.handleError(error);
			}
		})();
	}, []);

	return (
		<Wrapper navigation={navigation} showHeader={true} error={currentError} loading={!data.checkHours || !data.checkHours.users}>
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
