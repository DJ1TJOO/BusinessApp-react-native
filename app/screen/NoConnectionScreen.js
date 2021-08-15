import NetInfo from "@react-native-community/netinfo";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import FormButton from "../components/form/FormButton";
import { IconCross, IconEarth, IconServers } from "../components/Icons";

import Colors from "../config/Colors";
import config from "../config/config";
import FontSizes from "../config/FontSizes";

import useErrorModal from "../hooks/useErrorModal";

import utils from "../utils";

const NoConnectionScreen = ({ navigation, route }) => {
	const [currentError, setCurrentError, ErrorModal] = useErrorModal();

	const servers = !!route.params?.servers;
	const Icon = servers ? IconServers : IconEarth;
	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<Icon style={styles.icon} />
				<IconCross style={styles.iconCross} />
			</View>
			<Text style={styles.header}>Geen verbinding</Text>
			<Text style={styles.info}>
				{servers ? "BusinessApp kon geen verbinding maken met de servers" : "BusinessApp heeft een internet verbinding nodig om te kunnen funcitoneren"}
			</Text>
			<FormButton
				style={styles.retry}
				onPress={() => {
					NetInfo.fetch().then(async (state) => {
						if (state.isConnected) {
							try {
								const res = await utils.fetchWithTimeout(config.api).then((res) => res.json());
								if (res.success) {
									navigation.goBack();
								} else {
									navigation.navigate("NoConnection", { servers: true });
								}
							} catch (error) {
								navigation.navigate("NoConnection", { servers: true });
							}
						} else setCurrentError("Geen verbinding");
					});
				}}
			>
				Opnieuw proberen
			</FormButton>
			{ErrorModal}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
	iconContainer: { width: 150, height: 150 },
	icon: { top: 0, width: "100%", height: "100%" },
	iconCross: { position: "absolute", zIndex: 1, top: "-33%", left: "-7%", width: "140%", height: "150%" },
	header: {
		color: Colors.textPrimary,
		fontSize: FontSizes.heading,
		fontFamily: "Segoe-UI",
		marginTop: 20,
		textAlign: "center",
	},
	info: {
		color: Colors.textSecondary,
		fontSize: FontSizes.default,
		fontFamily: "Segoe-UI",
		textAlign: "center",
	},
	retry: { marginTop: 10 },
});

export default NoConnectionScreen;
