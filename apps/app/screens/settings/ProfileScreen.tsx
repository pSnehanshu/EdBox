import { ScrollView } from "react-native";
import { View, Text } from "../../components/Themed";
import { Image, StyleSheet } from "react-native";
import { Button } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
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
          <Text style={styles.value}>John Doe</Text>
          <Text style={styles.value}>johndoe@gmail.com</Text>
          <Text style={styles.value}>Goalpara, Assam</Text>
          <View style={{ marginTop: 8 }}>
            <Button radius={"sm"} type="outline">
              <Text style={styles.button_text}>Update</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
  button_text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
