import React from "react";
import { Text, View } from "react-native";

import { IconLoading } from "./Icons";

const Loading = ({ size = 50, text, textStyle, direction, isActive, style }) => {
	return isActive ? (
		<View
			// eslint-disable-next-line react-native/no-inline-styles
			style={[
				{
					justifyContent: "center",
					alignItems: "center",
					flexDirection: direction,
					position: "absolute",
					height: "100%",
					width: "100%",
					zIndex: 999,
					elevation: 1,
				},
				style,
			]}
		>
			<IconLoading style={{ width: size, height: size, alignSelf: "center" }} />
			{text ? <Text style={textStyle}>{text}</Text> : null}
		</View>
	) : null;
};
export default Loading;
