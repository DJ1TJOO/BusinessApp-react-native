import React, { createRef } from "react";

export const navigationRef = createRef();

export function isAvailable() {
	return navigationRef && navigationRef.current;
}

export function navigate(name, params) {
	navigationRef.current?.navigate(name, params);
}

export function goBack() {
	navigationRef.current?.goBack();
}

export function getState() {
	return navigationRef.current?.getRootState();
}
