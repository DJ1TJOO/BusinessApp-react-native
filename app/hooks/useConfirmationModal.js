import React, { useEffect, useState } from "react";

import Modal, { MODAL_BUTTON_TYPES } from "../components/Modal";

import Colors from "../config/Colors";

/**
 * @typedef {{
 *  question: String,
 *  buttons: {
 *              cancel: String,
 *              accept: String
 *          },
 *  events: {
 *      onAccept: Function,
 *      onCancel: Function
 *  }
 * }} Confirmation
 */

/**
 * @param {Confirmation} confirmation
 * @returns {[
 *  String,
 *  (confirmation: Confirmation) => void,
 *  Modal|null
 * ]}
 */
const useConfirmationModal = (confirmation = null) => {
	const [currentConfirmation, setCurrentConfirmation] = useState(confirmation);
	const [ConfirmationModal, setConfirmationModal] = useState(null);

	useEffect(() => {
		if (currentConfirmation) {
			setConfirmationModal(
				<Modal
					info={currentConfirmation.question}
					buttons={[
						{ text: currentConfirmation.buttons.cancel, type: MODAL_BUTTON_TYPES.CANCEL, color: Colors.primary },
						{ text: currentConfirmation.buttons.accept, type: MODAL_BUTTON_TYPES.ACCEPT, color: Colors.red },
					]}
					onDismiss={(text, type, color) => {
						if (type === MODAL_BUTTON_TYPES.CANCEL) currentConfirmation.events.onCancel();
						else if (type === MODAL_BUTTON_TYPES.ACCEPT) currentConfirmation.events.onAccept();

						setCurrentConfirmation(null);
					}}
				></Modal>
			);
		} else {
			setConfirmationModal(null);
		}
	}, [currentConfirmation]);

	return [currentConfirmation, setCurrentConfirmation, ConfirmationModal];
};

export default useConfirmationModal;
