import NetInfo from "@react-native-community/netinfo";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FormButton from "../components/form/FormButton";
import { IconCross, IconEarth } from "../components/Icons";
import Colors from "../config/Colors";
import FontSizes from "../config/FontSizes";
import useErrorModal from "../hooks/useErrorModal";

const NoConnectionScreen = ({ navigation }) => {
	const [currentError, setCurrentError, ErrorModal] = useErrorModal();

	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<IconEarth style={styles.iconEarth} />
				<IconCross style={styles.iconCross} />
			</View>
			<Text style={styles.header}>Geen verbinding</Text>
			<Text style={styles.info}>BusinessApp heeft een internet verbinding nodig om te kunnen funcitoneren</Text>
			<FormButton
				style={styles.retry}
				onPress={() => {
					NetInfo.fetch().then((state) => {
						if (state.isConnected) navigation.goBack();
						else setCurrentError("Geen verbinding");
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
	iconEarth: { top: 0, width: "100%", height: "100%" },
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
