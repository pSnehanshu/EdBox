import { useState } from "react";
import { Button } from "react-native";
import { View, Text, TextInput } from "../../components/Themed";
import { useSchool } from "../../utils/useSchool";
import { RootStackScreenProps } from "../../types";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay";
import { useSetAuthToken } from "../../utils/auth";

export default function LoginScreen({}: RootStackScreenProps<"Login">) {
  const school = useSchool();
  const [step, setStep] = useState<"requestOTP" | "submitOTP">("requestOTP");
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const setAuthToken = useSetAuthToken();
  const requestOtp = trpc.auth.requestEmailLoginOTP.useMutation({
    onSuccess() {
      setStep("submitOTP");
    },
  });
  const submitOTP = trpc.auth.submitEmailLoginOTP.useMutation({
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
            <Text>Email address:</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              autoFocus
              keyboardType="email-address"
              autoComplete="email"
            />
            <Button
              title="Generate OTP"
              onPress={() => {
                requestOtp.mutate({
                  email,
                  schoolId: school.id,
                });
              }}
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
              onPress={() =>
                submitOTP.mutate({
                  email,
                  otp,
                  schoolId: school.id,
                })
              }
            />
          </View>
        </>
      )}
    </View>
  );
}
