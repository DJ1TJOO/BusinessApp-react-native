import React from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, G, LinearGradient, Path, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedStop = Animated.createAnimatedComponent(Stop);

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
		iterations: repeatCount,
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

const IconLoading = ({ style, color, secondColor, animated = false }) => {
	const { style: anitmateStyle } = animateTransform({
		type: "rotate",
		from: "0 36 36",
		to: "360 36 36",
		dur: "1s",
		repeatCount: -1,
	});
	const { style: anitmateReverseStyle } = animateTransform({
		type: "rotate",
		from: "0 36 36",
		to: "-360 36 36",
		dur: "1s",
		repeatCount: -1,
	});

	const ViewForm = animated ? Animated.View : View;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg
				xmlns="http://www.w3.org/2000/svg"
				style={{
					margin: "auto",
					background: "0 0",
				}}
				width={"100%"}
				height={"100%"}
				viewBox="0 0 72 72"
				preserveAspectRatio="xMidYMid"
			>
				<AnimatedCircle
					cx={36}
					cy={36}
					r={34}
					strokeWidth={4}
					stroke={(style && style.color) || color || "#108bdd"}
					strokeDasharray="53.40707511102649 53.40707511102649"
					fill="none"
					strokeLinecap="round"
					style={anitmateStyle}
				></AnimatedCircle>
				<AnimatedCircle
					cx={36}
					cy={36}
					r={29}
					strokeWidth={4}
					stroke={(style && style.secondColor) || secondColor || "#dde3f3"}
					strokeDasharray="45.553093477052 45.553093477052"
					strokeDashoffset={45.553 + 35}
					fill="none"
					strokeLinecap="round"
					style={anitmateReverseStyle}
				></AnimatedCircle>
			</Svg>
		</ViewForm>
	);
};

const IconArrowBack = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 10.015 11">
				<G data-name="Union 16" fill="rgba(0,0,0,0)" strokeLinecap="round" strokeLinejoin="round">
					<Path d="M5.324 10.677l-5-5L.5 5.5l-.177-.176 5-5 .354.353L1.104 5.25h8.411v.5H1.104l4.573 4.573-.353.354z" />
					<PathForm
						d="M5.5 10.5l-5-5 5 5m4.015-5H.5h9.015M.5 5.5l5-5-5 5m5 5.5a.498.498 0 01-.353-.147L.148 5.856l-.002-.002A.499.499 0 010 5.504.52.52 0 010 5.5a.446.446 0 010-.006.498.498 0 01.146-.347l5-5a.5.5 0 01.708.707L1.707 5h7.808a.5.5 0 010 1H1.707l4.147 4.146A.5.5 0 015.5 11z"
						fill={(style && style.color) || color || "#fff"}
					/>
				</G>
			</Svg>
		</ViewForm>
	);
};

const IconArrowForward = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const GForm = animated ? AnimatedG : G;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 10.015 11">
				<GForm data-name="Group 69" fill="none" stroke={(style && style.color) || color || "rgba(0,0,0,0)"} strokeLinecap="round">
					<Path data-name="Line 1" d="M.5 5.707h9.016" />
					<Path data-name="Line 2" d="M9.516 5.707l-5 5" />
					<Path data-name="Line 3" d="M9.516 5.707l-5-5" />
				</GForm>
			</Svg>
		</ViewForm>
	);
};

const IconArrowDown = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const GForm = animated ? AnimatedG : G;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11.414 10.223">
				<GForm data-name="Group 141" fill="none" stroke={(style && style.color) || color || "#333"} strokeLinecap="round">
					<Path data-name="Line 1" d="M5.707.5v9.016" />
					<Path data-name="Line 2" d="M5.707 9.516l-5-5" />
					<Path data-name="Line 3" d="M5.707 9.516l5-5" />
				</GForm>
			</Svg>
		</ViewForm>
	);
};

const IconArrowUp = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const GForm = animated ? AnimatedG : G;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11.414 10.223">
				<GForm data-name="Group 67" fill="none" stroke={(style && style.color) || color || "#333"} strokeLinecap="round">
					<Path data-name="Line 1" d="M5.707 9.723V.707" />
					<Path data-name="Line 2" d="M5.707.707l5 5" />
					<Path data-name="Line 3" d="M5.707.707l-5 5" />
				</GForm>
			</Svg>
		</ViewForm>
	);
};

const IconDown = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11 6.001">
				<PathForm
					data-name="Union 45"
					d="M5.5 5.5l-5-5 5 5 5-5z"
					fill="none"
					stroke={(style && style.color) || color || "#333"}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		</ViewForm>
	);
};

const IconUp = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 11 6.001">
				<PathForm
					data-name="Union 46"
					d="M5.5.5l5 5-5-5-5 5z"
					fill="none"
					stroke={(style && style.color) || color || "#333"}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		</ViewForm>
	);
};

const IconAgenda = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
				<PathForm
					data-name="Subtraction 1"
					d="M13.999 20h-8a6.006 6.006 0 01-6-6V7h20v7a6.007 6.007 0 01-6 6zm5.658-15H.341a6 6 0 014.658-3.917V1a1 1 0 011-1 1 1 0 011 1h6a1 1 0 011-1 1 1 0 011 1v.083a6 6 0 014.659 3.915z"
					fill={(style && style.color) || color || "rgb(237, 241, 253)"}
				/>
			</Svg>
		</ViewForm>
	);
};
const IconAgendaSelected = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
				<PathForm
					data-name="Subtraction 1"
					d="M13.999 20h-8a6.006 6.006 0 01-6-6V7h20v7a6.007 6.007 0 01-6 6zm5.658-15H.341a6 6 0 014.658-3.917V1a1 1 0 011-1 1 1 0 011 1h6a1 1 0 011-1 1 1 0 011 1v.083a6 6 0 014.659 3.915z"
					fill={(style && style.color) || color || "#333"}
				/>
			</Svg>
		</ViewForm>
	);
};

const IconCheck = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 16.5 10">
				<PathForm
					data-name="Union 8"
					d="M.5 5.229 L5.771 10.5z M15.771.5 l-10 10z"
					fill="rgba(0,0,0,0)"
					stroke={(style && style.color) || color || "#108bdd"}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		</ViewForm>
	);
};

const IconCross = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" top={"15%"} width={"80%"} height={"80%"} viewBox="0 0 10.5 10.5">
				<PathForm
					data-name="Union 9"
					d="M .5,.5 l 9.5,9.5 M 10,.5 l -9.5,9.5"
					fill="rgba(0,0,0,0)"
					stroke={(style && style.color) || color || "#dd1010"}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		</ViewForm>
	);
};

const IconRemove = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, { width: 40, height: 40 }, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
				<PathForm
					data-name="Path 38"
					d="M9.516.5H.5"
					fill="rgba(0,0,0,0)"
					stroke={(style && style.color) || color || "rgba(51,51,51,0.7)"}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		</ViewForm>
	);
};

const IconAdd = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;

	return (
		<ViewForm style={[styles.icon, { width: 40, height: 40 }, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 20 20">
				<G data-name="Union 13" fill="rgba(0,0,0,0)" strokeLinecap="round" strokeLinejoin="round">
					<Path d="M5.258 9.515h-.5V5.258H.5v-.5h4.258V.5h.5v4.258h4.257v.5H5.258v4.257z" />
					<PathForm
						d="M5.008 9.515V5.008h4.507-4.507V.5v9.015m0-4.507H.5h4.508m0 5.007a.5.5 0 01-.5-.5V5.508H.5a.5.5 0 010-1h4.008V.5a.5.5 0 011 0v4.008h4.007a.5.5 0 010 1H5.508v4.007a.5.5 0 01-.5.5z"
						fill={(style && style.color) || color || "#108bdd"}
					/>
				</G>
			</Svg>
		</ViewForm>
	);
};

const IconEarth = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const StopForm = animated ? AnimatedStop : Stop;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 512 512">
				<LinearGradient y2={0} y1={512} x2={256} gradientUnits="userSpaceOnUse" id="prefix__a" x1={256}>
					<StopForm offset={1} stopColor={(style && style.color) || color || "#108BDD"} />
				</LinearGradient>
				<Path
					d="M256 0C114.841 0 0 114.841 0 256s114.841 256 256 256 256-114.841 256-256S397.159 0 256 0zm-92.831 49.955l37.568 28.274-24.788 9.813a15.003 15.003 0 00-8.135 7.742l-13.253 29.173-55.268 27.625a15 15 0 00-8.22 11.937l-4.833 48.726-24.583-16.389-11.414-34.306c22.719-49.828 63.018-90.02 112.926-112.595zm-12.326 261.937L113.7 273.699v-19.316l32.885-.435 38.316 42.143a15.004 15.004 0 008.156 4.618l24.205 4.843-13.29 13.294a15 15 0 00-4.392 10.605v17.33l-27.109 20.33a15 15 0 00-6 11.946l-11.38-13.656V322.35a15.006 15.006 0 00-4.248-10.458zM256 482C131.383 482 30 380.617 30 256c0-15.565 1.582-30.768 4.593-45.456l.224.672a15 15 0 005.913 7.745l42.97 28.647v32.182c0 3.906 1.523 7.658 4.247 10.458l37.143 38.193v42.389c0 3.509 1.23 6.907 3.477 9.603l41.38 49.656a15.003 15.003 0 0016.63 4.501 15 15 0 009.894-14.104V386.61l27.109-20.33c3.777-2.833 6-7.279 6-12v-18.618l28.708-28.717a14.999 14.999 0 00-7.666-25.313l-46.843-9.372-39.541-43.49c-2.889-3.177-6.998-4.946-11.297-4.908l-37.658.498 4.826-48.642 52.617-26.3a14.998 14.998 0 006.95-7.213l12.946-28.497 44.029-17.431a15.001 15.001 0 003.499-25.931L196.96 37.84A225.485 225.485 0 01256 30c78.182 0 147.212 39.91 187.806 100.422l-31.873 10.977-39.499-6.586-12.956-19.426c-4.259-6.386-12.651-8.526-19.449-4.96l-104.49 54.83a15 15 0 003.503 27.877l67.614 16.064 19.46 30.231a14.999 14.999 0 0016.253 6.433l26.663-6.67 12.627 8.417v25.081a15 15 0 003.98 10.177l43.93 47.571.005 70.127C388.086 450.296 325.679 482 256 482zm203.57-157.431a15 15 0 00-3.98-10.176l-43.93-47.57V239.58c0-5.016-2.507-9.7-6.681-12.481l-24.83-16.55a14.994 14.994 0 00-11.959-2.07l-22.668 5.67-16.909-26.268a15 15 0 00-9.146-6.475l-34.512-8.199 57.058-29.94 9.067 13.596a15.003 15.003 0 0010.013 6.473l49.66 8.28c2.463.411 4.991.2 7.351-.613l40.971-14.11C473.747 186.834 482 220.469 482 256c0 35.135-8.061 68.421-22.428 98.11z"
					fill="url(#prefix__a)"
				/>
			</Svg>
		</ViewForm>
	);
};

const IconServers = ({ style, color, animated = false }) => {
	const ViewForm = animated ? Animated.View : View;
	const PathForm = animated ? AnimatedPath : Path;
	const CircleForm = animated ? AnimatedCircle : Circle;

	return (
		<ViewForm style={[styles.icon, style]}>
			<Svg xmlns="http://www.w3.org/2000/svg" width={"100%"} height={"100%"} viewBox="0 0 64 64">
				<PathForm fill={(style && style.color) || color || "#108BDD"} d="M28 9.014H8a.986.986 0 100 1.972h20a.986.986 0 100-1.972z" />
				<CircleForm fill={(style && style.color) || color || "#108BDD"} cx={52.999} cy={9.999} r={2.999} />
				<PathForm
					fill={(style && style.color) || color || "#108BDD"}
					d="M60 0H4a4 4 0 00-4 4v12a4 4 0 004 4h56a4 4 0 004-4V4a4 4 0 00-4-4zm2 16c0 1.103-.897 2-2 2H4c-1.103 0-2-.897-2-2V4c0-1.103.897-2 2-2h56c1.103 0 2 .897 2 2v12zM28 31.014H8a.986.986 0 100 1.972h20a.986.986 0 100-1.972z"
				/>
				<CircleForm fill={(style && style.color) || color || "#108BDD"} cx={52.999} cy={31.999} r={2.999} />
				<PathForm
					fill={(style && style.color) || color || "#108BDD"}
					d="M60 22H4a4 4 0 00-4 4v12a4 4 0 004 4h56a4 4 0 004-4V26a4 4 0 00-4-4zm2 16c0 1.103-.897 2-2 2H4c-1.103 0-2-.897-2-2V26c0-1.103.897-2 2-2h56c1.103 0 2 .897 2 2v12zM28 53.014H8a.986.986 0 100 1.972h20a.986.986 0 100-1.972z"
				/>
				<CircleForm fill={(style && style.color) || color || "#108BDD"} cx={52.999} cy={53.999} r={2.999} />
				<PathForm
					fill={(style && style.color) || color || "#108BDD"}
					d="M60 44H4a4 4 0 00-4 4v12a4 4 0 004 4h56a4 4 0 004-4V48a4 4 0 00-4-4zm2 16c0 1.103-.897 2-2 2H4c-1.103 0-2-.897-2-2V48c0-1.103.897-2 2-2h56c1.103 0 2 .897 2 2v12z"
				/>
			</Svg>
		</ViewForm>
	);
};

export {
	IconLoading,
	IconArrowBack,
	IconArrowForward,
	IconArrowUp,
	IconArrowDown,
	IconUp,
	IconDown,
	IconAgenda,
	IconAgendaSelected,
	IconCheck,
	IconCross,
	IconRemove,
	IconAdd,
	IconEarth,
	IconServers,
};
