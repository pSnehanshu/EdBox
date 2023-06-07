import { useState } from "react";
import { ModalTextInput } from "../../components/ModalTextInput";
import { List, Text, View } from "../../components/Themed";
import { RootStackScreenProps } from "../../utils/types/common";
import { Pressable, StyleSheet, Image, Alert } from "react-native";
import { FAB, ListItem } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { trpc } from "../../utils/trpc";
import { useFileUpload } from "../../utils/file-upload";
import { UserAvatar } from "../../components/Avatar";
import Spinner from "react-native-loading-spinner-overlay";
import { PendingAttachment } from "../../components/attachments/PendingAttachment";
import { Avatar } from "@rneui/base";

export default function ProfileEditScreen({
  navigation,
  route: {
    params: { userId },
  },
}: RootStackScreenProps<"ProfileEditScreen">) {
  const scheme = useColorScheme();
  const profileQuery = trpc.profile.getUserProfile.useQuery({ userId });
  const user = profileQuery.data;
  const uploadAvatar = trpc.profile.changeAvatar.useMutation({
    async onSuccess(data) {
      Alert.alert("Avatar uploaded");
    },
    onError(error) {
      console.error(error);
    },
  });
  const fileUploadHandler = useFileUpload();
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const iconColor = scheme === "dark" ? "white" : "black";
  if (!user) return <Spinner visible />;
  return (
    <View style={{ flex: 1 }}>
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
            onPress={() => fileUploadHandler.pickAndUploadFile()}
            style={({ pressed }) => [
              styles.attach_btn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="upload" size={26} color={"#4E48B2"} />
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
                <ListItem.Title>{userName || user?.name}</ListItem.Title>
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
            uploadAvatar.mutate({
              file_permission: {
                permission_id: fileUploadHandler.uploadTasks[0].permission.id,
                file_name: fileUploadHandler.uploadTasks[0].file.name,
              },
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
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageContainer: {
    position: "relative",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    marginBottom: 16,
    padding: 8,
  },
  detailsContainer: {
    flex: 2,
    marginLeft: 16,
    justifyContent: "flex-start",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pending_attachments_list: {
    backgroundColor: "transparent",
  },
  attach_btn: {
    position: "absolute",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 100,
    bottom: "5%",
    right: "5%",
    borderColor: "#4E48B2",
    padding: 2,
  },
});
