import React, { useEffect, useState } from "react";

import Modal from "../components/Modal";

/**
 * @param {String} info
 * @returns {[
 *  String,
 *  (info: String) => void,
 *  Modal|null
 * ]}
 */
const useInfoModal = (info) => {
	const [currentInfo, setCurrentInfo] = useState(info);
	const [InfoModal, setInfoModal] = useState(null);

	useEffect(() => {
		if (currentInfo) {
			setInfoModal(<Modal info={currentInfo} onDismiss={() => setCurrentInfo(null)}></Modal>);
		} else {
			setInfoModal(null);
		}
	}, [currentInfo]);

	return [currentInfo, setCurrentInfo, InfoModal];
};

export default useInfoModal;
