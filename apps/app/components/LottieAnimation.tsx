import Lottie from "lottie-react-native";
import { ComponentProps } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Text, View } from "./Themed";

interface LottieAnimationProps {
  src: ComponentProps<typeof Lottie>["source"];
  caption?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  FooterComponent?: React.ReactNode;
  FooterComponentStyle?: StyleProp<ViewStyle>;
}

export function LottieAnimation({
  src,
  caption,
  height,
  style,
  FooterComponent,
  FooterComponentStyle,
}: LottieAnimationProps) {
  return (
    <View style={style}>
      <View style={[styles.lottie, { height: height ?? 300 }]}>
        <Lottie source={src} autoPlay loop />
      </View>
      <Text style={styles.caption}>{caption}</Text>

      {FooterComponent && (
        <View style={[styles.footer, FooterComponentStyle]}>
          {FooterComponent}
        </View>
      )}
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
    marginHorizontal: 8,
  },
  footer: {
    justifyContent: "center",
  },
});
