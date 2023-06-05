import { View, Text } from "../../components/Themed";
import { Image, StyleSheet } from "react-native";
import { useCurrentUser } from "../../utils/auth";

export default function ProfileScreen() {
  const { isLoggedIn, user } = useCurrentUser();

  if (!isLoggedIn) return null;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.image}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.value}>{user.name}</Text>
          <Text style={styles.value}>{user.phone}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  imageContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-end",
    marginBottom: 18,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 75,
  },
  detailsContainer: {
    flex: 2,
    marginLeft: 18,
    justifyContent: "flex-start",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    // marginBottom: 8,
  },
});
