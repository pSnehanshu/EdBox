import { StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { trpc } from "../utils/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useConfig } from "../utils/config";

export default function SchoolNotFound() {
  const utils = trpc.useContext();
  const config = useConfig();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong!</Text>
      <Text style={styles.text}>
        Looks like your school is either blocked or this app is configured
        incorrectly. In both cases, try contacting your school administration.
      </Text>

      <View style={styles.tryAgain}>
        <Ionicons.Button
          name="reload"
          onPress={() => {
            utils.school.schoolBasicInfo.invalidate();
          }}
        >
          Try again
        </Ionicons.Button>
      </View>

      <Text style={styles.debugInfo}>School ID: {config.schoolId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    borderColor: "red",
    borderWidth: 10,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    textAlign: "center",
    marginVertical: 8,
  },
  tryAgain: {
    width: 120,
    alignSelf: "center",
    marginVertical: 16,
  },
  debugInfo: {
    textAlign: "center",
    marginTop: 24,
    opacity: 0.5,
  },
});
