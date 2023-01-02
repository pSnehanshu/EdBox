import { useState } from "react";
import { Button } from "react-native";
import { View, Text, TextInput } from "../../components/Themed";
import { useSchool } from "../../hooks/useSchool";
import { RootStackScreenProps } from "../../types";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay";

export default function LoginScreen({}: RootStackScreenProps<"Login">) {
  const school = useSchool();
  const [step, setStep] = useState<"requestOTP" | "submitOTP">("requestOTP");
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const requestOtp = trpc.auth.requestEmailLoginOTP.useMutation({
    onSuccess() {
      setStep("submitOTP");
    },
  });
  const submitOTP = trpc.auth.submitEmailLoginOTP.useMutation({
    onSuccess(data) {
      alert(`Token: ${data.token}`);
    },
  });

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
              onChangeText={(v) => setEmail(v)}
              placeholder="Email address"
            />
          </View>

          <Button
            title="Generate OTP"
            onPress={() => {
              requestOtp.mutate({
                email,
                schoolId: school.id,
              });
            }}
          />
        </>
      ) : (
        <>
          <View>
            <Text>Enter OTP:</Text>
            <TextInput
              value={otp}
              onChangeText={(v) => setOTP(v)}
              placeholder="OTP"
            />
          </View>

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
        </>
      )}
    </View>
  );
}
