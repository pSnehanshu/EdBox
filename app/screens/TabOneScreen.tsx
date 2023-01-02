import { StyleSheet } from "react-native";
import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { useSchool } from "../hooks/useSchool";
import { RootTabScreenProps } from "../types";
import { useCurrentUser } from "../utils/auth";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const school = useSchool();
  const user = useCurrentUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Text>{JSON.stringify(school, null, 2)}</Text>
      <Text>{JSON.stringify(user, null, 2)}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="/screens/TabOneScreen.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
