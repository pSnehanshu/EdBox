import { Dimensions, Pressable, StyleSheet } from "react-native";
import { List, ScrollView, Text, View } from "../../components/Themed";
import type { RootStackScreenProps } from "../../utils/types/common";
import { Image, ListItem, Switch } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { ModalTextInput } from "../../components/ModalTextInput";
import { useState } from "react";
import { Carousel } from "react-native-snap-carousel";

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
  const [muteNotification, setMuteNotification] = useState<boolean>(false);
  const [groupDetails, setGroupDetails] = useState<string | undefined>(
    "chat details...." ?? undefined,
  );
  const SLIDER_WIDTH = Dimensions.get("window").width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.35);

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
            <ModalTextInput
              onChange={setGroupDetails}
              defaultValue={groupDetails}
              title="Group Details"
            />
            <View style={styles.media_container}>
              <Text style={{ marginLeft: 16, fontSize: 16 }}>
                Media, links and docs
              </Text>
              <Carousel
                layout="default"
                vertical={false}
                layoutCardOffset={9}
                firstItem={0}
                data={[
                  { name: "1" },
                  { name: "2" },
                  { name: "1" },
                  { name: "2" },
                  { name: "1" },
                  { name: "2" },
                ]}
                renderItem={({ item, index }) => (
                  <SingleMediaCard period={item} index={index} />
                )}
                sliderWidth={SLIDER_WIDTH}
                itemWidth={ITEM_WIDTH}
                inactiveSlideShift={0}
                inactiveSlideOpacity={1}
                inactiveSlideScale={1}
                activeSlideAlignment="start"
                useExperimentalSnap
                slideStyle={{ marginLeft: 16, marginTop: 8 }}
              />
            </View>

            <View style={styles.container_default}>
              <Text
                style={{
                  textAlignVertical: "center",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Mute notifications
              </Text>

              <Switch
                trackColor={{ true: "#3bde50", false: "#f5f6fc" }}
                thumbColor="#FFF"
                value={muteNotification}
                onValueChange={setMuteNotification}
              />
            </View>
            <View
              style={{
                marginHorizontal: 16,
                marginVertical: 8,
                width: "100%",
                height: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                }}
              >
                3 participants
              </Text>
              <List
                data={[
                  { name: "Simanta Ray", id: 1, status: "Not gone respawn" },
                  {
                    name: "Snehanshu Phukan",
                    id: 2,
                    status: "probably coding....",
                  },
                  {
                    name: "Mrityunjoy Bora Ray",
                    id: 3,
                    status: "hey there",
                  },
                ]}
                renderItem={({ item }) => <Partcipants item={item} />}
                estimatedItemSize={200}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

export function SingleMediaCard({ details }: any) {
  return (
    <View style={styles.container_carousel}>
      <Text> </Text>
    </View>
  );
}

export function Partcipants({ item }: any) {
  return (
    <View style={styles.card}>
      <Image
        source={require("../../assets/images/multiple-users-silhouette.png")}
        style={styles.image}
      />
      <View style={{ flexDirection: "column", marginLeft: 8 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
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
  media_container: {
    flexDirection: "column",
    paddingTop: 16,
    justifyContent: "center",
  },
  container_carousel: {
    alignItems: "center",
    backgroundColor: "gray",
    borderRadius: 8,
    margin: 4,
    height: 120,
  },
  container_default: {
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    borderBottomWidth: 0.5,
    borderColor: "gray",
    marginVertical: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 0.5,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
  },
});
