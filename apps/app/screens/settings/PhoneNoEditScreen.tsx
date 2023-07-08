import { useState } from "react";
import { ModalTextInput } from "../../components/ModalTextInput";
import { View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackScreenProps } from "../../utils/types/common";
import { FAB } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert } from "react-native";
import OtpPopUpTwo from "../../components/OtpPopUpTwo";
import Spinner from "react-native-loading-spinner-overlay";
import { useCurrentUser } from "../../utils/auth";

export default function PhoneNoEditScreen({
  navigation,
}: RootStackScreenProps<"PhoneNoEditScreen">) {
  const { user } = useCurrentUser();
  const trpcUtils = trpc.useContext();

  const [phoneNo, setPhoneNo] = useState<string | undefined>(
    user?.phone ?? undefined,
  );
  const [otpPopUp, setOtpPopUp] = useState(false);
  const [isd, setIsd] = useState(91);

  const changePhoneRequestOTP = trpc.profile.changePhoneRequestOTP.useMutation({
    onSuccess({ expiry }) {
      setOtpPopUp(true);
    },
    onError(error) {
      console.error(error);
      Alert.alert("Error", error.message);
    },
  });

  const changePhoneSumbitOTP = trpc.profile.changePhoneSumbitOTP.useMutation({
    onSuccess() {
      trpcUtils.profile.me.refetch();

      if (user?.id) {
        trpcUtils.profile.getUserProfile.refetch({ userId: user.id });
        navigation.navigate("ProfileScreen", { userId: user.id });
      }
    },
    onError(error) {
      console.error(error);
      Alert.alert("Error", error.message);
    },
  });

  if (!user?.id) return null;

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
        number
      />
      <OtpPopUpTwo
        visible={otpPopUp}
        userId={user?.id}
        onClose={() => setOtpPopUp(false)}
        onSubmit={(otpOld, otpNew) => {
          changePhoneSumbitOTP.mutate({
            old_otp: otpOld,
            new_otp: otpNew,
          });
        }}
        oldPhoneNo={`+${user?.phone_isd_code}-${user?.phone}`}
        newPhoneNo={`+${isd}-${phoneNo}`}
      />
      <FAB
        onPress={() => {
          if (phoneNo) {
            changePhoneRequestOTP.mutate({
              isd: isd,
              phoneNumber: phoneNo,
            });
          }
        }}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        icon={<MaterialCommunityIcons name="check" size={24} color={"white"} />}
        placement="right"
      />
    </View>
  );
}
