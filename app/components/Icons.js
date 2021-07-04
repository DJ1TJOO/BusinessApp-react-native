import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

import ArrowBack from "../assets/icons/arrows/arrow_back.svg";

const createIcon =
	(svg) =>
	({ style }) =>
		(
			<View style={style}>
				<SvgXml xml={svg} width="100%" height="100%" />
			</View>
		);

const IconArrowBack = createIcon(ArrowBack);

export { IconArrowBack };
