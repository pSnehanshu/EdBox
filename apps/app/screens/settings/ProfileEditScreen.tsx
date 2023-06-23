import { useEffect, useMemo, useState } from "react";
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
import { CustomSelect } from "../../components/CustomSelect";
import DatePicker from "react-native-date-picker";
import { format } from "date-fns";

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
  console.log(JSON.stringify(user, null, 2));
  const fileUploadHandler = useFileUpload();
  const isUploading =
    fileUploadHandler.uploadTasks.length > 0
      ? !fileUploadHandler.allDone
      : false;

  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  type Gender = "Male" | "Female" | "Others";
  const defaultGender: Gender[] = ["Male", "Female", "Others"];
  type Salutation =
    | "Mr"
    | "Mrs"
    | "Ms"
    | "Dr"
    | "Miss"
    | "Prof"
    | "None"
    | undefined;
  const defaultSalutations = ["Mr", "Mrs", "Ms", "Dr", "Miss", "Prof", "None"];
  type BloodType =
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | "Others"
    | undefined;
  const defaultBloodGroups = [
    "A+",
    "B+",
    "AB+",
    "O+",
    "A-",
    "B-",
    "AB-",
    "O-",
    "Others",
  ];

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [salutation, setSalutation] = useState<string>(
    user?.salutation ?? "None",
  );
  const bloodGroup = useMemo<string>(() => {
    switch (user?.blood_group) {
      case "Ap":
        return "A+";
      case "Bp":
        return "B+";
      case "ABp":
        return "AB+";
      case "Op":
        return "O+";
      case "An":
        return "A-";
      case "Bn":
        return "B-";
      case "ABn":
        return "AB-";
      case "On":
        return "O-";
      case "Other":
        return "Others";
      default:
        return "Unknown";
    }
  }, [user?.blood_group]);

  const [blood_group, setBloodGroup] = useState<string>(bloodGroup);
  const [birthOfDate, setBirthOfDate] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof user?.name === "string") setUserName(user.name);
    if (typeof user?.gender === "string") setGender(user.gender);
    // if (typeof user?.salutation === "string") setSalutation(user.salutation);

    // if (typeof user?.blood_group === "string") setBloodGroup(user.blood_group);
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
            <UserAvatar fileId={user.avatar_id} size={120} rounded />
          )}

          <Pressable
            onPress={() => {
              fileUploadHandler.removeAll();
              fileUploadHandler.pickAndUploadMediaLib();
            }}
            style={({ pressed }) => [
              styles.attach_btn,
              {
                opacity: pressed ? 0.5 : 0.7,
                backgroundColor: scheme === "light" ? "white" : "black",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isUploading ? "close" : "upload"}
              size={24}
              color={iconColor}
            />
          </Pressable>
        </View>
        {/* form */}
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
        <ModalTextInput
          isVisible={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          onChange={setUserName}
          defaultValue={userName}
          title="Your Name"
        />

        <CustomSelect
          isSingle
          title="Salutation"
          items={defaultSalutations}
          selected={salutation}
          onSubmit={(item) => {
            if (item) setSalutation(item);
          }}
          idExtractor={(item) => item}
          labelExtractor={(item) => `${item}`}
          style={{ flexGrow: 1 }}
          // isLoading={}
        />

        <CustomSelect
          isSingle
          title="Gender"
          items={defaultGender}
          selected={gender}
          onSubmit={(item) => {
            setGender(item);
          }}
          idExtractor={(item) => item}
          labelExtractor={(item) => `${item}`}
          style={{ flexGrow: 1 }}
          // isLoading={}
        />
        <CustomSelect
          isSingle
          title="Blood Group"
          items={defaultBloodGroups}
          selected={blood_group}
          onSubmit={(item) => {
            if (item) setBloodGroup(item);
          }}
          idExtractor={(item) => item}
          labelExtractor={(item) => `${item}`}
          style={{ flexGrow: 1 }}
          // isLoading={}
        />

        <DatePicker
          modal
          open={datePickerVisible}
          date={birthOfDate ?? new Date()}
          mode="date"
          title="Select due date"
          theme={scheme}
          maximumDate={new Date()}
          onConfirm={(date) => {
            setBirthOfDate(date);
            setDatePickerVisible(false);
          }}
          onCancel={() => {
            setDatePickerVisible(false);
          }}
        />
        <Pressable
          onPress={() => setDatePickerVisible((v) => !v)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.2 : 1,
          })}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title style={{ fontSize: 14 }}>
                Birth date
              </ListItem.Title>
              <ListItem.Subtitle style={{ fontSize: 16 }}>
                {birthOfDate
                  ? format(birthOfDate, "MMM dd, yyyy")
                  : "Select Birth date"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </Pressable>
        {/* address */}
      </View>

      <FAB
        onPress={() => {
          updateUserDetails.mutate({
            avatar_file_permission:
              fileUploadHandler.uploadTasks.length > 0
                ? {
                    permission_id:
                      fileUploadHandler.uploadTasks[0].permission.id,
                    file_name: fileUploadHandler.uploadTasks[0].file.name,
                  }
                : undefined,
            name: userName,
            gender: gender,
            salutation: "Miss",
            blood_group: "Ap",
            date_of_birth: birthOfDate?.toISOString(),
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
    // paddingHorizontal: 24,
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
    borderRadius: 100,
    padding: 4,
  },
});
