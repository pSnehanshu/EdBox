import { StyleSheet } from "react-native";
import { View } from "./Themed";
import { LottieAnimation } from "./LottieAnimation";

export const NoClassesToday: React.FC = () => {
  return (
    <View style={styles.container}>
      <LottieAnimation
        src={require("../assets/lotties/no-classes.json")}
        caption="No classes today, relax!"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    height: "100%",
  },
});
