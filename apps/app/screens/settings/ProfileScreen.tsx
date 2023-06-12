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
          {/* <Text style={styles.value}>{user.gender}</Text> */}
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
  value: { textAlign: "center", fontSize: 18, fontWeight: "bold" },
});
