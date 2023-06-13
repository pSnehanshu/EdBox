import { useEffect, useState } from "react";
import { ModalTextInput } from "../../components/ModalTextInput";
import { View } from "../../components/Themed";
import { RootStackScreenProps } from "../../utils/types/common";
import { Pressable, StyleSheet } from "react-native";
import { FAB, ListItem } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { trpc } from "../../utils/trpc";
import { useFileUpload } from "../../utils/file-upload";
import { UserAvatar } from "../../components/Avatar";
import Spinner from "react-native-loading-spinner-overlay";
import { Avatar } from "@rneui/base";

export default function ProfileEditScreen({
  navigation,
  route: {
    params: { userId },
  },
}: RootStackScreenProps<"ProfileEditScreen">) {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const trpcUtils = trpc.useContext();

  const profileQuery = trpc.profile.getUserProfile.useQuery({ userId });
  const user = profileQuery.data;

  const fileUploadHandler = useFileUpload();
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  const [userName, setUserName] = useState("");
  useEffect(() => {
    if (typeof user?.name === "string") setUserName(user.name);
  }, [user?.name]);

  const updateUserDetails = trpc.profile.update.useMutation({
    async onSuccess() {
      profileQuery.refetch();
      trpcUtils.profile.me.refetch();

      navigation.navigate("ProfileScreen", { userId });
    },
    onError(error) {
      console.error(error);
    },
  });

  if (!user) return <Spinner visible />;

  return (
    <View style={{ flex: 1 }}>
      <Spinner
        visible={updateUserDetails.isLoading}
        textContent="Please wait..."
      />

      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {fileUploadHandler.uploadTasks.length > 0 ? (
            <Avatar
              source={{ uri: fileUploadHandler.uploadTasks[0].file.uri }}
              size={120}
              rounded
            />
          ) : (
            <UserAvatar fileId={user?.avatar_id} size={120} rounded />
          )}
          <Pressable
            onPress={() => fileUploadHandler.pickAndUploadMediaLib()}
            style={({ pressed }) => [
              styles.attach_btn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="upload" size={26} color={"white"} />
          </Pressable>
        </View>

        <View style={styles.detailsContainer}>
          <Pressable
            onPress={() => setIsTextModalOpen(true)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.2 : 1,
            })}
          >
            <ListItem>
              <ListItem.Content>
                <ListItem.Subtitle>Edit Name</ListItem.Subtitle>
                <ListItem.Title>{userName}</ListItem.Title>
              </ListItem.Content>
              <MaterialCommunityIcons
                name="chevron-right"
                color={iconColor}
                size={16}
              />
            </ListItem>
          </Pressable>
        </View>
      </View>

      <ModalTextInput
        isVisible={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onChange={setUserName}
        defaultValue={userName}
        title="Your Name"
      />

      <FAB
        onPress={() => {
          if (fileUploadHandler)
            updateUserDetails.mutate({
              avatar_file_permission: {
                permission_id: fileUploadHandler.uploadTasks[0].permission.id,
                file_name: fileUploadHandler.uploadTasks[0].file.name,
              },
              name: userName,
            });
        }}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        icon={<MaterialCommunityIcons name="check" size={24} color={"white"} />}
        placement="right"
      />
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

  pending_attachments_list: {
    backgroundColor: "transparent",
  },
  attach_btn: {
    position: "absolute",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 100,
    borderColor: "white",
    padding: 2,
  },
});
