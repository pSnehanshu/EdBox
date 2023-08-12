import { useCallback, useState } from "react";
import { StyleSheet, Pressable, Alert } from "react-native";
import type { ClassWithSections, Section } from "schooltalk-shared/types";
import Spinner from "react-native-loading-spinner-overlay";
import { View, Text, TextInput } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { useConfig } from "../../utils/config";
import OtpPopup from "../../components/OtpPopup";
import useColorScheme from "../../utils/useColorScheme";
import { CustomSelect } from "../../components/CustomSelect";
import { useSetAuthToken } from "../../utils/auth";
import { getPushToken } from "../../utils/push-notifications";

export default function LoginScreen() {
  const config = useConfig();
  const setAuthToken = useSetAuthToken();

  // Form States
  const [phone, setPhone] = useState("");
  const [rollnum, setRollNo] = useState<number>();
  const [userId, setUserId] = useState<string | null>(null);
  const [insufficientData, setInsufficientData] = useState(false);

  // Query
  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: config.schoolId },
      { cacheTime: 0 },
    );

  // Selection state
  const [formType, setFormType] = useState<"others" | "student">("others");
  const [step, setStep] = useState<"requestOTP" | "submitOTP">("requestOTP");
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<Section>();

  // Mutations
  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setStep("submitOTP");
    },
    onError(error) {
      console.error(error);
      Alert.alert("Error", "Phone number isn't registered");
      setPhone("");
    },
  });
  const requestRollNumberOTP = trpc.auth.rollNumberLoginRequestOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setStep("submitOTP");
    },
    onError(error) {
      console.error(error);
      Alert.alert(
        "Invalid data",
        "Looks like the roll number is not registered",
      );
      setRollNo(undefined);
    },
  });

  const onSubmit = useCallback(
    async (otp: string) => {
      if (userId && otp) {
        submitOTPMutation.mutate({
          userId,
          otp,
          schoolId: config.schoolId,
          // Also pass device push token if possible
          pushToken: await getPushToken()
            .then((token) => ({
              token,
              type: "expo" as const,
            }))
            .catch((err) => {
              alert((err as any)?.message);
              return undefined;
            }),
        });
      }
    },
    [userId, config.schoolId],
  );

  const submitOTPMutation = trpc.auth.submitLoginOTP.useMutation({
    async onSuccess(data) {
      setAuthToken(data.token, new Date(data.expiry_date));
    },
    onError(error) {
      console.error(error);
      Alert.alert("Invalid OTP", "Looks like the OTP you entered is incorrect");
    },
  });

  const color = useColorScheme();

  return (
    <View
      style={{
        height: "100%",
      }}
    >
      <Spinner
        visible={
          requestOtp.isLoading ||
          requestRollNumberOTP.isLoading ||
          submitOTPMutation.isLoading
        }
        textContent="Please wait..."
      />
      {/* login */}
      <View style={styles.container}>
        <View
          style={[
            styles.buttonContainer,
            { backgroundColor: color === "dark" ? "white" : "black" },
          ]}
        >
          <Pressable
            style={
              formType === "others"
                ? {
                    ...styles.active_button,
                    backgroundColor: color === "dark" ? "black" : "white",
                  }
                : {
                    ...styles.default_button,
                    backgroundColor: color === "dark" ? "white" : "black",
                  }
            }
            onPress={() => setFormType("others")}
          >
            <Text
              style={[
                formType === "others"
                  ? styles.active_button_text
                  : {
                      ...styles.default_button_text,
                      color: color === "dark" ? "black" : "white",
                    },
                { marginBottom: 2 },
              ]}
            >
              For parents, teachers, and staff
            </Text>
          </Pressable>
          <Pressable
            style={
              formType === "student"
                ? {
                    ...styles.active_button,
                    backgroundColor: color === "dark" ? "black" : "white",
                  }
                : {
                    ...styles.default_button,
                    backgroundColor: color === "dark" ? "white" : "black",
                  }
            }
            onPress={() => setFormType("student")}
          >
            <Text
              style={[
                formType === "student"
                  ? styles.active_button_text
                  : {
                      ...styles.default_button_text,
                      color: color === "dark" ? "black" : "white",
                    },
                { marginVertical: 6 },
              ]}
            >
              For Students
            </Text>
          </Pressable>
        </View>
      </View>

      {formType === "others" ? (
        <>
          {/* others */}
          <View style={{ height: "100%" }}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              autoFocus
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            <Pressable
              style={({ pressed }) => [
                styles.main_button,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() => {
                if (phone)
                  requestOtp.mutate({
                    phoneNumber: phone,
                    schoolId: config.schoolId,
                  });
              }}
            >
              <Text style={styles.button_text}>Request OTP</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {/* student */}
          <View>
            <View style={{ flexDirection: "row" }}>
              <CustomSelect
                isSingle
                title="Class"
                items={classesAndSectionsData.data}
                selected={selectedClass}
                onSubmit={(item) => {
                  setSelectedClass(item);
                  setSelectedSection(undefined);
                }}
                idExtractor={(item) => item.numeric_id}
                labelExtractor={(item) =>
                  `Class ${item.name ?? item.numeric_id}`
                }
                style={{ flexGrow: 1 }}
              />

              <CustomSelect
                isSingle
                title="Section"
                items={selectedClass?.Sections}
                selected={selectedSection}
                onSubmit={(item) => setSelectedSection(item)}
                idExtractor={(item) => item.numeric_id}
                labelExtractor={(item) =>
                  `Section ${item.name ?? item.numeric_id}`
                }
                style={{ flexGrow: 1 }}
              />
            </View>
            <View>
              <TextInput
                style={styles.input}
                value={rollnum?.toString()}
                onChangeText={(r) => {
                  const parsed = parseInt(r, 10);
                  setRollNo(Number.isNaN(parsed) ? undefined : parsed);
                }}
                placeholder="Roll number"
                keyboardType="number-pad"
              />

              {insufficientData && (
                <Text style={{ color: "red", textAlign: "center", margin: 16 }}>
                  Please fill all the values
                </Text>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.main_button,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                onPress={() => {
                  if (
                    typeof rollnum === "number" &&
                    selectedClass &&
                    selectedSection
                  ) {
                    setInsufficientData(false);

                    requestRollNumberOTP.mutate({
                      class_id: selectedClass?.numeric_id,
                      section_id: selectedSection.numeric_id,
                      school_id: config.schoolId,
                      rollnum,
                    });
                  } else {
                    setInsufficientData(true);
                  }
                }}
              >
                <Text style={styles.button_text}>Request OTP</Text>
                <Text style={[styles.button_text, { fontSize: 12 }]}>
                  OTP will be sent to your parents
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {step === "submitOTP" && (
        <OtpPopup
          visible={true}
          userId={userId}
          onSubmit={(otp: any) => onSubmit(otp)}
          onClose={() => setStep("requestOTP")}
          description={
            formType === "student"
              ? "OTP has been sent to your parent's phone number"
              : "OTP has been sent to your phone number"
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: "row",
  },
  main_button: {
    backgroundColor: "#4E48B2",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },

  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 24,
  },
  default_button: {
    flex: 1,
    padding: 4,
    margin: 5,
    borderRadius: 20,
    backgroundColor: "black",
  },
  active_button: {
    flex: 1,
    padding: 4,
    margin: 5,
    borderRadius: 20,
    backgroundColor: "white",
  },
  default_button_text: {
    paddingHorizontal: 4,
    paddingTop: 6,
    textAlign: "center",
    fontSize: 16,
  },
  button_text: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  active_button_text: {
    paddingHorizontal: 4,
    paddingTop: 6,
    textAlign: "center",
    fontSize: 16,
  },
  input: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    marginHorizontal: 16,
  },
});
