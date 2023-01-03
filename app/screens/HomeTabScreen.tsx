import { StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { useSchool } from "../hooks/useSchool";
import { RootTabScreenProps } from "../types";
import { useCurrentUser } from "../utils/auth";

export default function HomeTabScreen({}: RootTabScreenProps<"HomeTab">) {
  const school = useSchool();
  const user = useCurrentUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Text>{JSON.stringify(school, null, 2)}</Text>
      <Text>{JSON.stringify(user, null, 2)}</Text>
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
});
