import { Pressable, StyleSheet } from "react-native";
import { ScrollView, Text, View } from "../../components/Themed";
import type { RootStackScreenProps } from "../../utils/types/common";
import { Image, ListItem } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { ModalTextInput } from "../../components/ModalTextInput";
import { useState } from "react";

export default function ChatGroupDetails({
  navigation,
  route: {
    params: { params },
  },
}: RootStackScreenProps<"ChatGroupDetails">) {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const [groupName, setGroupName] = useState<string | undefined>(
    params.name ?? undefined,
  );

  return (
    <View style={{ height: "100%" }}>
      <ScrollView>
        {params && (
          <>
            <View style={styles.container}>
              <View style={styles.imageContainer}>
                <Image
                  source={require("../../assets/images/multiple-users-silhouette.png")}
                  style={styles.chatGroupIcon}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.attach_btn,
                    {
                      opacity: pressed ? 0.5 : 0.7,
                      backgroundColor: scheme === "light" ? "white" : "black",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={"upload"}
                    size={24}
                    color={iconColor}
                  />
                </Pressable>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.value}>Group - 15 participants</Text>
              </View>
            </View>
            <ModalTextInput
              onChange={setGroupName}
              defaultValue={groupName}
              title="Group Name"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: "center",
  },
  imageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  detailsContainer: {
    justifyContent: "center",
  },
  value: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoTable: {
    marginTop: 16,
  },
  chatGroupIcon: {
    width: 100,
    height: 100,
    aspectRatio: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 50,
  },
  attach_btn: {
    position: "absolute",
    alignItems: "center",
    borderRadius: 100,
    padding: 4,
  },
});
