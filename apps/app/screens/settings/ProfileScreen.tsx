import { useMemo, type ComponentProps } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { FAB } from "@rneui/themed";
import { MaterialCommunityIcons, Fontisto, Entypo } from "@expo/vector-icons";
import { ListItem } from "@rneui/themed";
import { format, parseISO } from "date-fns";
import { dbBloodGroupToUIBloodGroup } from "schooltalk-shared/misc";
import { View, Text, ScrollView } from "../../components/Themed";
import { useCurrentUser } from "../../utils/auth";
import type { RootStackScreenProps } from "../../utils/types/common";
import { UserAvatar } from "../../components/Avatar";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";

export default function ProfileScreen({
  navigation,
  route: {
    params: { userId },
  },
}: RootStackScreenProps<"ProfileScreen">) {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const { user: currentUser } = useCurrentUser();
  const profileQuery = trpc.profile.getUserProfile.useQuery({ userId });
  const user = profileQuery.data;

  const isCurrentUser = currentUser?.id === userId;

  const genderIconName = useMemo<
    ComponentProps<typeof MaterialCommunityIcons>["name"]
  >(() => {
    switch (user?.gender) {
      case "Male":
        return "gender-male";
      case "Female":
        return "gender-female";
      case "Others":
        return "gender-non-binary";
      default:
        return "account-question-outline";
    }
  }, [user?.gender]);

  const bloodGroup = user?.blood_group
    ? dbBloodGroupToUIBloodGroup(user.blood_group) ?? "Unknown"
    : "Unknown";

  return (
    <View style={{ height: "100%" }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isFetching}
            onRefresh={() => profileQuery.refetch()}
          />
        }
      >
        {user && (
          <>
            <View style={styles.container}>
              <View style={styles.imageContainer}>
                <UserAvatar fileId={user.avatar_id} size={120} rounded />
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.value}>
                  {user.salutation === "None" ? "" : user.salutation + ". "}
                  {user.name}{" "}
                  <MaterialCommunityIcons
                    name={genderIconName}
                    size={24}
                    color={iconColor}
                  />
                </Text>
              </View>
            </View>

            <View style={styles.infoTable}>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>Date of birth</ListItem.Title>
                  <ListItem.Subtitle>
                    {user.date_of_birth
                      ? format(parseISO(user.date_of_birth), "do MMMM, yyy")
                      : "Unknown"}
                  </ListItem.Subtitle>
                </ListItem.Content>

                <MaterialCommunityIcons
                  name="cake-variant"
                  size={24}
                  color={iconColor}
                />
              </ListItem>

              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>Blood group</ListItem.Title>
                  <ListItem.Subtitle>{bloodGroup}</ListItem.Subtitle>
                </ListItem.Content>

                <Fontisto name="blood-drop" size={24} color={iconColor} />
              </ListItem>

              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>Address</ListItem.Title>
                  {user.addr_l1 && (
                    <ListItem.Subtitle>{user.addr_l1}</ListItem.Subtitle>
                  )}
                  {user.addr_l2 && (
                    <ListItem.Subtitle>{user.addr_l2}</ListItem.Subtitle>
                  )}
                  {user.addr_town_vill && (
                    <ListItem.Subtitle>{user.addr_town_vill}</ListItem.Subtitle>
                  )}
                  {(user.addr_city || user.addr_pin) && (
                    <ListItem.Subtitle>
                      {user.addr_city ? user.addr_city + ", " : ""}
                      {user.addr_pin ? "PIN-" + user.addr_pin : ""}
                    </ListItem.Subtitle>
                  )}
                  {(user.addr_state || user.addr_country) && (
                    <ListItem.Subtitle>
                      {user.addr_state ? user.addr_state + ", " : ""}
                      {user.addr_country}
                    </ListItem.Subtitle>
                  )}
                </ListItem.Content>

                <Entypo name="location" size={24} color={iconColor} />
              </ListItem>
            </View>
          </>
        )}
      </ScrollView>

      {
        // Only show edit option for current user's profile
        isCurrentUser && (
          <FAB
            buttonStyle={{ backgroundColor: "#4E48B2" }}
            onPress={() =>
              navigation.navigate("ProfileEditScreen", {
                userId: currentUser.id,
              })
            }
            icon={
              <MaterialCommunityIcons
                name="lead-pencil"
                size={24}
                color={"white"}
              />
            }
            placement="right"
          />
        )
      }
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
});
