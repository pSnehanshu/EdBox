import { Text } from "@rneui/themed";
import { StyleSheet } from "react-native";
import Lottie from "lottie-react-native";
import { View } from "./Themed";

export const NoClassesToday: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <Lottie
          source={{
            // TODO: Don't use URLs, rather download the file and reference locally
            uri: "https://assets10.lottiefiles.com/packages/lf20_bwncrbab.json",
          }}
          autoPlay
          loop
        />
      </View>
      <Text style={styles.text}>No classes today, relax!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    textAlign: "center",
    fontSize: 16,
  },
  animationContainer: {
    height: 300,
    width: "100%",
  },
});
