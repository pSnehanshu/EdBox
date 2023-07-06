import { useState } from "react";
import { ModalTextInput } from "../../components/ModalTextInput";
import { Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackScreenProps } from "../../utils/types/common";
import { FAB } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import OtpPopup from "../../components/OtpPopup";
import { Alert } from "react-native";

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
      <ModalTextInput
        onChange={setPhoneNo}
        defaultValue={phoneNo}
        title="Phone No"
      />
      {/* <OtpPopup
        visible={otpPopUp}
        userId={userId}
        onClose={() => setOtpPopUp(false)}
        description={"OTP has been sent to new Phone No"}
        onSubmit={}
      /> */}
      <FAB
        onPress={() => {
          setOtpPopUp(true);
        }}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        icon={<MaterialCommunityIcons name="check" size={24} color={"white"} />}
        placement="right"
      />
    </View>
  );
}
