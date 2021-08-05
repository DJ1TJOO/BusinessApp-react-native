import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Modal from "../components/Modal";
import { IconCross } from "../components/Icons";
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
		height: 35,
		width: 35,
		marginTop: -5,
	},
});

export default useErrorModal;
