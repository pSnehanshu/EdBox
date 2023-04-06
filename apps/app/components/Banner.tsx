import { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import useColorScheme from "../utils/useColorScheme";
import { Text, View } from "./Themed";

interface BannerProps {
  text: string;
  type: "error" | "info" | "success";
  style?: StyleProp<ViewStyle>;
}
export function Banner(props: BannerProps) {
  const scheme = useColorScheme();

  const { accent, txt } = useMemo<{ accent: string; txt: string }>(() => {
    switch (props.type) {
      case "info":
        return {
          accent: "#87CEEB",
          txt: scheme === "dark" ? "white" : "black",
        };
      case "error":
        return { accent: "#ED4337", txt: "#ED4337" };
      case "success":
        return { accent: "#4F8A10", txt: "#4F8A10" };
    }
  }, [props.type, scheme]);

  return (
    <View style={[styles.container, props.style, { borderColor: accent }]}>
      <Text style={[{ color: txt }]}>{props.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingVertical: 16,
    margin: 4,
    marginHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderLeftWidth: 8,
  },
});
