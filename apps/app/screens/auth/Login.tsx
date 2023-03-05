import { useState } from "react";
import { Button } from "react-native";
import { View, Text, TextInput } from "../../components/Themed";
import { useSchool } from "../../utils/useSchool";
import { RootStackScreenProps } from "../../utils/types/common";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay";
import { useSetAuthToken } from "../../utils/auth";

export default function LoginScreen({}: RootStackScreenProps<"Login">) {
  const school = useSchool();
  const [step, setStep] = useState<"requestOTP" | "submitOTP">("requestOTP");
  const [phone, setPhone] = useState("");
  const [otp, setOTP] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const setAuthToken = useSetAuthToken();
  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setStep("submitOTP");
    },
  });
  const submitOTP = trpc.auth.submitLoginOTP.useMutation({
    onSuccess(data) {
      setAuthToken(data.token, new Date(data.expiry_date));
    },
  });

  if (!school) return null;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
      }}
    >
      <Spinner
        visible={requestOtp.isLoading || submitOTP.isLoading}
        textContent="Please wait..."
      />

      {step === "requestOTP" ? (
        <>
          <View>
            <Text>Phone number:</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              autoFocus
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Button
              title="Generate OTP"
              onPress={() =>
                requestOtp.mutate({
                  phoneNumber: phone,
                  schoolId: school.id,
                })
              }
            />
          </View>
        </>
      ) : (
        <>
          <View>
            <Text>Enter OTP:</Text>
            <TextInput
              value={otp}
              onChangeText={setOTP}
              placeholder="OTP"
              autoFocus
              keyboardType="number-pad"
            />
            <Button
              title="Login"
              onPress={() => {
                if (userId) {
                  submitOTP.mutate({
                    userId,
                    otp,
                    schoolId: school.id,
                  });
                } else {
                  alert("User ID is still null");
                }
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}
