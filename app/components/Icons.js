import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

const styles = StyleSheet.create({
	icon: {
		top: 10,
		width: 20,
		height: 20,
	},
});

const IconArrowBack = ({ style }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 10.015 11">
			<G data-name="Union 16" fill="rgba(0,0,0,0)" strokeLinecap="round" strokeLinejoin="round">
				<Path d="M5.324 10.677l-5-5L.5 5.5l-.177-.176 5-5 .354.353L1.104 5.25h8.411v.5H1.104l4.573 4.573-.353.354z" />
				<Path
					d="M5.5 10.5l-5-5 5 5m4.015-5H.5h9.015M.5 5.5l5-5-5 5m5 5.5a.498.498 0 01-.353-.147L.148 5.856l-.002-.002A.499.499 0 010 5.504.52.52 0 010 5.5a.446.446 0 010-.006.498.498 0 01.146-.347l5-5a.5.5 0 01.708.707L1.707 5h7.808a.5.5 0 010 1H1.707l4.147 4.146A.5.5 0 015.5 11z"
					fill="#fff"
				/>
			</G>
		</Svg>
	</View>
);

const IconAgenda = ({ style }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path
				data-name="Subtraction 1"
				d="M13.999 20h-8a6.006 6.006 0 01-6-6V7h20v7a6.007 6.007 0 01-6 6zm5.658-15H.341a6 6 0 014.658-3.917V1a1 1 0 011-1 1 1 0 011 1h6a1 1 0 011-1 1 1 0 011 1v.083a6 6 0 014.659 3.915z"
				fill="rgb(237, 241, 253)"
			/>
		</Svg>
	</View>
);
const IconAgendaSelected = ({ style }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path
				data-name="Subtraction 1"
				d="M13.999 20h-8a6.006 6.006 0 01-6-6V7h20v7a6.007 6.007 0 01-6 6zm5.658-15H.341a6 6 0 014.658-3.917V1a1 1 0 011-1 1 1 0 011 1h6a1 1 0 011-1 1 1 0 011 1v.083a6 6 0 014.659 3.915z"
				fill="#333"
			/>
		</Svg>
	</View>
);

export { IconArrowBack, IconAgenda, IconAgendaSelected };