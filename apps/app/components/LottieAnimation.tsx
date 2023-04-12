import Lottie from "lottie-react-native";
import { ComponentProps } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Text, View } from "./Themed";

interface LottieAnimationProps {
  src: ComponentProps<typeof Lottie>["source"];
  caption?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function LottieAnimation({
  src,
  caption,
  height,
  style,
}: LottieAnimationProps) {
  return (
    <View style={style}>
      <View style={[styles.lottie, { height: height ?? 300 }]}>
        <Lottie source={src} autoPlay loop />
      </View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: "100%",
  },
  caption: {
    textAlign: "center",
    fontSize: 16,
  },
});
