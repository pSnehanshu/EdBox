import { useState } from "react";
import DatePicker from "react-native-date-picker";
import { format } from "date-fns";
import type {
  DBBloodGroup,
  Gender,
  Saluation,
  UIBloodGroup,
} from "schooltalk-shared/types";
import {
  uiBloodGroupToDBBloodGroup,
  dbBloodGroupToUIBloodGroup,
} from "schooltalk-shared/misc";
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
  const isUploading =
    fileUploadHandler.uploadTasks.length > 0
      ? !fileUploadHandler.allDone
      : false;

  const defaultGender: Gender[] = ["Male", "Female", "Others"];
  const defaultSalutations: Saluation[] = [
    "Mr",
    "Mrs",
    "Miss",
    "Dr",
    "Miss",
    "Prof",
    "None",
  ];
  const defaultBloodGroups: UIBloodGroup[] = [
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
  const [userName, setUserName] = useState(user?.name ?? "");
  const [gender, setGender] = useState<Gender | undefined>(
    user?.gender ?? undefined,
  );
  const [salutation, setSalutation] = useState<Saluation>(
    user?.salutation ?? "None",
  );

  const [blood_group, setBloodGroup] = useState<DBBloodGroup | undefined>(
    user?.blood_group ?? undefined,
  );
  const [birthOfDate, setBirthOfDate] = useState<Date | null>(
    user?.date_of_birth ? user.date_of_birth : null,
  );

  const [addressLine1, setAddressLine1] = useState<string | undefined>(
    user?.addr_l1 ?? undefined,
  );
  const [addressLine2, setAddressLine2] = useState<string | undefined>(
    user?.addr_l2 ?? undefined,
  );
  const [addressTown, setAddressTown] = useState<string | undefined>(
    user?.addr_town_vill ?? undefined,
  );
  const [addressCity, setAddressCity] = useState<string | undefined>(
    user?.addr_city ?? undefined,
  );
  const [addressState, setAddressState] = useState<string | undefined>(
    user?.addr_state ?? undefined,
  );
  const [addressPin, setAddressPin] = useState<string | undefined>(
    user?.addr_pin?.toString() ?? undefined,
  );
  const [addressCountry, setAddressCountry] = useState<string | undefined>(
    user?.addr_country ?? undefined,
  );

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

        <View style={styles.detailsContainerPlus}>
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
          />
          <View style={{ width: "50%" }}>
            <ModalTextInput
              onChange={setUserName}
              defaultValue={userName}
              title="Name"
            />
          </View>
        </View>

        <View style={styles.detailsContainerPlus}>
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
          />

          <CustomSelect
            isSingle
            title="Blood Group"
            items={defaultBloodGroups}
            selected={
              blood_group ? dbBloodGroupToUIBloodGroup(blood_group) : null
            }
            onSubmit={(item) => {
              if (item) setBloodGroup(uiBloodGroupToDBBloodGroup(item));
            }}
            idExtractor={(item) => (item ? item : "?")}
            labelExtractor={(item) => `${item}`}
            style={{ flexGrow: 1 }}
          />
        </View>

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

        <View style={styles.detailsContainer}>
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
        </View>

        <View style={styles.detailsContainer}>
          <ModalTextInput
            onChange={setAddressLine1}
            defaultValue={addressLine1}
            title="Address Line 2"
          />
        </View>
        <View style={styles.detailsContainer}>
          <ModalTextInput
            onChange={setAddressLine2}
            defaultValue={addressLine2}
            title="Address Line 2"
          />
        </View>
        <View style={styles.detailsContainerPlus}>
          <ModalTextInput
            onChange={setAddressTown}
            defaultValue={addressTown}
            title="Town/Village name"
            selectorStyle={{ width: "50%" }}
          />
          <ModalTextInput
            onChange={setAddressCity}
            defaultValue={addressCity}
            title="City"
            selectorStyle={{ width: "50%" }}
          />
        </View>

        <View style={styles.detailsContainerPlus}>
          <ModalTextInput
            onChange={setAddressState}
            defaultValue={addressState}
            title="State"
            selectorStyle={{ width: "50%" }}
          />

          <ModalTextInput
            onChange={setAddressPin}
            defaultValue={addressPin}
            title="PIN code"
            number
            selectorStyle={{ width: "50%" }}
          />
        </View>

        <View>
          <ModalTextInput
            onChange={setAddressCountry}
            defaultValue={addressCountry}
            title="Country"
          />
        </View>
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
            salutation: salutation,
            blood_group: blood_group,
            date_of_birth: birthOfDate?.toISOString(),
            address: {
              line1: addressLine1 ?? "",
              line2: addressLine2 ?? "",
              town_or_village: addressTown ?? "",
              city: addressCity ?? undefined,
              pin: addressPin ? parseInt(addressPin) : undefined,
              state: addressState ?? undefined,
              country: addressCountry ?? "",
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
    flexDirection: "column",
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
    marginVertical: -6,
  },
  detailsContainerPlus: { flexDirection: "row", marginVertical: -6 },
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
