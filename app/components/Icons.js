import React, { useMemo } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function animateTransform({ type, from, to, dur, repeatCount }) {
	const duration = parseFloat(dur.slice(0, -1)) * 1000;
	const [fromAngle, fromCX, fromCY] = from.split(" ").map(Number);
	const [toAngle, toCX, toCY] = to.split(" ").map(Number);

	const t = new Animated.Value(0);
	const animateTransform = [
		Animated.timing(t, {
			duration,
			toValue: 1,
			useNativeDriver: false,
			easing: Easing.linear,
		}),
	];
	const animation = Animated.loop(Animated.sequence(animateTransform), {
		iterations: -1,
	}).start();
	const rotateAngle = t.interpolate({
		inputRange: [0, 1],
		outputRange: [fromAngle + "deg", toAngle + "deg"],
	});
	const cx = t.interpolate({
		inputRange: [0, 1],
		outputRange: [fromCX, toCX],
	});
	const cy = t.interpolate({
		inputRange: [0, 1],
		outputRange: [fromCY, toCY],
	});
	const icx = t.interpolate({
		inputRange: [0, 1],
		outputRange: [-fromCX, -toCX],
	});
	const icy = t.interpolate({
		inputRange: [0, 1],
		outputRange: [-fromCY, -toCY],
	});
	const style = {
		transform: [{ translateX: cx }, { translateY: cy }, { rotateZ: rotateAngle }, { translateX: icx }, { translateY: icy }],
	};
	return { t, animation, style, rotateAngle, cx, cy, icx, icy };
}

const styles = StyleSheet.create({
	icon: {
		top: 10,
		width: 20,
		height: 20,
	},
});

// TODO: fix on android
const IconLoading = ({ style, color, secondColor }) => {
	const { style: anitmateStyle } = animateTransform({
		type: "rotate",
		from: "0 50 50",
		to: "360 50 50",
		dur: "1s",
		repeatCount: "indefinite",
	});
	const { style: anitmateReverseStyle } = animateTransform({
		type: "rotate",
		from: "0 50 50",
		to: "-360 50 50",
		dur: "1s",
		repeatCount: "indefinite",
	});

	return (
		<View style={[styles.icon, style]}>
			<Svg
				xmlns="http://www.w3.org/2000/svg"
				style={{
					margin: "auto",
					background: "0 0",
				}}
				width={"100%"}
				height={"100%"}
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid"
				display="block"
			>
				<AnimatedCircle
					cx={50}
					cy={50}
					r={34}
					strokeWidth={4}
					stroke={color || "#108bdd"}
					strokeDasharray="53.40707511102649 53.40707511102649"
					fill="none"
					strokeLinecap="round"
					style={anitmateStyle}
				></AnimatedCircle>
				<AnimatedCircle
					cx={50}
					cy={50}
					r={29}
					strokeWidth={4}
					stroke={secondColor || "#dde3f3"}
					strokeDasharray="45.553093477052 45.553093477052"
					strokeDashoffset={45.553}
					fill="none"
					strokeLinecap="round"
					style={anitmateReverseStyle}
				></AnimatedCircle>
			</Svg>
		</View>
	);
};

const IconArrowBack = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 10.015 11">
			<G data-name="Union 16" fill="rgba(0,0,0,0)" strokeLinecap="round" strokeLinejoin="round">
				<Path d="M5.324 10.677l-5-5L.5 5.5l-.177-.176 5-5 .354.353L1.104 5.25h8.411v.5H1.104l4.573 4.573-.353.354z" />
				<Path
					d="M5.5 10.5l-5-5 5 5m4.015-5H.5h9.015M.5 5.5l5-5-5 5m5 5.5a.498.498 0 01-.353-.147L.148 5.856l-.002-.002A.499.499 0 010 5.504.52.52 0 010 5.5a.446.446 0 010-.006.498.498 0 01.146-.347l5-5a.5.5 0 01.708.707L1.707 5h7.808a.5.5 0 010 1H1.707l4.147 4.146A.5.5 0 015.5 11z"
					fill={color || "#fff"}
				/>
			</G>
		</Svg>
	</View>
);
const IconArrowForward = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 10.015 11">
			<G data-name="Group 69" fill="none" stroke={color || "rgba(0,0,0,0)"} strokeLinecap="round">
				<Path data-name="Line 1" d="M.5 5.707h9.016" />
				<Path data-name="Line 2" d="M9.516 5.707l-5 5" />
				<Path data-name="Line 3" d="M9.516 5.707l-5-5" />
			</G>
		</Svg>
	</View>
);

const IconArrowDown = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11.414 10.223">
			<G data-name="Group 141" fill="none" stroke={color || "#333"} strokeLinecap="round">
				<Path data-name="Line 1" d="M5.707.5v9.016" />
				<Path data-name="Line 2" d="M5.707 9.516l-5-5" />
				<Path data-name="Line 3" d="M5.707 9.516l5-5" />
			</G>
		</Svg>
	</View>
);

const IconArrowUp = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11.414 10.223">
			<G data-name="Group 67" fill="none" stroke={color || "#333"} strokeLinecap="round">
				<Path data-name="Line 1" d="M5.707 9.723V.707" />
				<Path data-name="Line 2" d="M5.707.707l5 5" />
				<Path data-name="Line 3" d="M5.707.707l-5 5" />
			</G>
		</Svg>
	</View>
);

const IconDown = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11 6.001">
			<Path data-name="Union 45" d="M5.5 5.5l-5-5 5 5 5-5z" fill="none" stroke={color || "#333"} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	</View>
);

const IconUp = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11 6.001">
			<Path data-name="Union 46" d="M5.5.5l5 5-5-5-5 5z" fill="none" stroke={color || "#333"} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	</View>
);

const IconAgenda = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path
				data-name="Subtraction 1"
				d="M13.999 20h-8a6.006 6.006 0 01-6-6V7h20v7a6.007 6.007 0 01-6 6zm5.658-15H.341a6 6 0 014.658-3.917V1a1 1 0 011-1 1 1 0 011 1h6a1 1 0 011-1 1 1 0 011 1v.083a6 6 0 014.659 3.915z"
				fill={color || "rgb(237, 241, 253)"}
			/>
		</Svg>
	</View>
);
const IconAgendaSelected = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path
				data-name="Subtraction 1"
				d="M13.999 20h-8a6.006 6.006 0 01-6-6V7h20v7a6.007 6.007 0 01-6 6zm5.658-15H.341a6 6 0 014.658-3.917V1a1 1 0 011-1 1 1 0 011 1h6a1 1 0 011-1 1 1 0 011 1v.083a6 6 0 014.659 3.915z"
				fill={color || "#333"}
			/>
		</Svg>
	</View>
);

const IconCheck = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path data-name="Union 8" d="M.5 5.229L5.771 10.5zM15.771.5l-10 10z" fill="rgba(0,0,0,0)" stroke={color || "#108bdd"} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	</View>
);

const IconCross = ({ style, color }) => (
	<View style={[styles.icon, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path
				data-name="Union 9"
				d="M5.617 5.872L.5 11l5.117-5.128L.5.5l5.117 5.372L10.979.5 5.617 5.872 10.5 11z"
				fill="rgba(0,0,0,0)"
				stroke={color || "#dd1010"}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	</View>
);

const IconRemove = ({ style, color }) => (
	<View style={[styles.icon, { width: 40, height: 40 }, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<Path data-name="Path 38" d="M9.516.5H.5" fill="rgba(0,0,0,0)" stroke={color || "rgba(51,51,51,0.7)"} strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	</View>
);

const IconAdd = ({ style, color }) => (
	<View style={[styles.icon, { width: 40, height: 40 }, style]}>
		<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
			<G data-name="Union 13" fill="rgba(0,0,0,0)" strokeLinecap="round" strokeLinejoin="round">
				<Path d="M5.258 9.515h-.5V5.258H.5v-.5h4.258V.5h.5v4.258h4.257v.5H5.258v4.257z" />
				<Path
					d="M5.008 9.515V5.008h4.507-4.507V.5v9.015m0-4.507H.5h4.508m0 5.007a.5.5 0 01-.5-.5V5.508H.5a.5.5 0 010-1h4.008V.5a.5.5 0 011 0v4.008h4.007a.5.5 0 010 1H5.508v4.007a.5.5 0 01-.5.5z"
					fill={color || "#108bdd"}
				/>
			</G>
		</Svg>
	</View>
);

export { IconLoading, IconArrowBack, IconArrowForward, IconArrowUp, IconArrowDown, IconUp, IconDown, IconAgenda, IconAgendaSelected, IconCheck, IconCross, IconRemove, IconAdd };
