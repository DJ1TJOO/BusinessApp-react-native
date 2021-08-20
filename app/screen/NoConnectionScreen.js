import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import api from "../api";

import FormButton from "../components/form/FormButton";
import { IconCross, IconEarth, IconServers } from "../components/Icons";

import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";

import useErrorModal from "../hooks/useErrorModal";

const NoConnectionScreen = ({ navigation, route }) => {
	const [currentError, setCurrentError, ErrorModal] = useErrorModal();

	const [servers, setServers] = useState(false);
	const Icon = servers ? IconServers : IconEarth;

	const state = NetInfo.useNetInfo();

	useEffect(() => {
		if (!state.isConnected) {
			setServers(false);
		} else {
			if (route.params && route.params.servers) {
				setServers(true);
			} else {
				setServers(false);
			}
		}
	}, [route, state]);

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
				onPress={async () => {
					if (state.isConnected) {
						try {
							const res = await api.fetchToken().then((res) => res.json());
							if (res.success) {
								navigation.goBack();
							} else {
								if (!servers) setServers(true);
								else setCurrentError("Geen verbinding met server");
							}
						} catch (error) {
							console.log(error);
							if (!servers) setServers(true);
							else setCurrentError("Geen verbinding");
						}
					} else {
						if (servers) setServers(false);
						setCurrentError("Geen verbinding");
					}
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
