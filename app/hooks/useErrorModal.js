import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { IconCross } from "../components/Icons";
import Modal from "../components/Modal";

import Colors from "../config/Colors";

/**
 * @param {String} error
 * @returns {[
 *  String,
 *  (error: String) => void,
 *  Modal|null
 * ]}
 */
const useErrorModal = (error) => {
	const [currentError, setCurrentError] = useState(error);
	const [ErrorModal, setErrorModal] = useState(null);

	useEffect(() => {
		if (currentError) {
			setErrorModal(
				<Modal
					error={currentError}
					icon={
						<View style={styles.errorIcon}>
							<IconCross style={styles.errorCross} />
						</View>
					}
					onDismiss={() => setCurrentError(null)}
				></Modal>
			);
		} else {
			setErrorModal(null);
		}
	}, [currentError]);

	return [currentError, setCurrentError, ErrorModal];
};

const styles = StyleSheet.create({
	errorIcon: {
		borderColor: Colors.red,
		justifyContent: "space-evenly",
		padding: 8,
		height: 40,
		width: 40,
		borderRadius: 12,
		borderWidth: 2,
		marginTop: 10,
		alignSelf: "center",
	},
	errorCross: {
		height: 30,
		width: 30,
		marginTop: -3,
		marginLeft: -1,
		top: 0,
	},
});

export default useErrorModal;
