import { useState } from "react";
import { ModalTextInput } from "../../components/ModalTextInput";
import { Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackScreenProps } from "../../utils/types/common";
import { FAB } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OtpPopup from "../../components/OtpPopup";
import { Alert } from "react-native";
import OtpPopUpTwo from "../../components/OtpPopUpTwo";
import Spinner from "react-native-loading-spinner-overlay";

export default function PhoneNoEditScreen({
  navigation,
  route: {
    params: { userId },
  },
}: RootStackScreenProps<"PhoneNoEditScreen">) {
  const profileQuery = trpc.profile.getUserProfile.useQuery({ userId });
  const user = profileQuery.data;
  const [phoneNo, setPhoneNo] = useState<string | undefined>(
    user?.phone ?? undefined,
  );
  const [otpPopUp, setOtpPopUp] = useState(false);

  const changePhoneRequestOTP = trpc.profile.changePhoneRequestOTP.useMutation({
    onSuccess(data) {
      console.log(data);
    },
    onError(error) {
      console.error(error);
      Alert.alert("Error", "Phone number isn't registered");
    },
  });

  const changePhoneSumbitOTP = trpc.profile.changePhoneSumbitOTP.useMutation({
    onSuccess(data) {
      console.log(data);
    },
    onError(error) {
      console.error(error);
      Alert.alert("Error", "Phone number isn't registered");
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Spinner
        visible={
          changePhoneRequestOTP.isLoading || changePhoneSumbitOTP.isLoading
        }
        textContent="Please wait..."
      />
      <ModalTextInput
        onChange={setPhoneNo}
        defaultValue={phoneNo}
        title="Phone No"
      />
      <OtpPopUpTwo
        visible={otpPopUp}
        userId={userId}
        onClose={() => setOtpPopUp(false)}
        onSubmit={(otpOld, otpNew) => {
          changePhoneSumbitOTP.mutate({
            old_otp: otpOld,
            new_otp: otpNew,
          });
        }}
      />
      <FAB
        onPress={() => {
          setOtpPopUp(true);
          changePhoneRequestOTP.mutate({
            isd: 91,
            phoneNumber: "NewPhoneNo",
          });
        }}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        icon={<MaterialCommunityIcons name="check" size={24} color={"white"} />}
        placement="right"
      />
    </View>
  );
}
