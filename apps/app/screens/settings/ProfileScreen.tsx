import { FAB } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import { View, Text } from "../../components/Themed";
import { StyleSheet } from "react-native";
import { useCurrentUser } from "../../utils/auth";
import type { RootStackScreenProps } from "../../utils/types/common";
import { UserAvatar } from "../../components/Avatar";
import { trpc } from "../../utils/trpc";

export default function ProfileScreen({
  navigation,
  route: {
    params: { userId },
  },
}: RootStackScreenProps<"ProfileScreen">) {
  const { user: currentUser } = useCurrentUser();
  const profileQuery = trpc.profile.getUserProfile.useQuery({ userId });
  const user = profileQuery.data;

  if (!user) return <Spinner visible />;
  const isCurrentUser = currentUser?.id === userId;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <UserAvatar fileId={user.avatar_id} size={120} rounded />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.value}>{user.name}</Text>
        </View>
      </View>

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
  detailsContainer: {
    flex: 2,
    marginLeft: 18,
    justifyContent: "flex-start",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
