import { useMemo, useState } from "react";
import { StyleSheet, Pressable, Alert } from "react-native";
import type { ClassWithSections, Section } from "schooltalk-shared/types";
import { View, Text, TextInput } from "../../components/Themed";
import { RootStackScreenProps } from "../../utils/types/common";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay";
import SelectDropdown from "react-native-select-dropdown";
import config from "../../config";
import OtpPopup from "../../components/OtpPopup";

export default function LoginScreen({}: RootStackScreenProps<"Login">) {
  // Form States
  const [phone, setPhone] = useState("");
  const [rollnum, setRollNo] = useState<number>();
  const [userId, setUserId] = useState<string | null>(null);
  const [insufficientData, setInsufficientData] = useState(false);

  // Query
  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery({
      schoolId: config.schoolId,
    });

  // Selection state
  const [formType, setFormType] = useState<"others" | "student">("others");
  const [step, setStep] = useState<"requestOTP" | "submitOTP">("requestOTP");
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<Section>();

  // Derived data
  const allClassesNames = useMemo(
    () =>
      classesAndSectionsData.data?.map(
        (a) => `Class ${a.name ?? a.numeric_id}`,
      ) ?? [],
    [classesAndSectionsData.isFetching],
  );
  const allSections = useMemo(() => {
    if (selectedClass) {
      return selectedClass.Sections.map(
        (section) => `Section ${section.name ?? section.numeric_id}`,
      );
    }
    return [];
  }, [selectedClass?.numeric_id]);

  // Mutations
  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setStep("submitOTP");
    },
    onError(error, variables, context) {
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
    onError(error, variables, context) {
      console.error(error);
      Alert.alert(
        "Invalid data",
        "Looks like the roll number is not registered",
      );
      setRollNo(undefined);
    },
  });

  return (
    <View
      style={{
        height: "100%",
      }}
    >
      <Spinner
        visible={requestOtp.isLoading || requestRollNumberOTP.isLoading}
        textContent="Please wait..."
      />
      {/* login */}
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={
              formType === "others"
                ? styles.active_button
                : styles.default_button
            }
            onPress={() => setFormType("others")}
          >
            <Text
              style={
                formType === "others"
                  ? styles.active_button_text
                  : styles.default_button_text
              }
            >
              Others
            </Text>
          </Pressable>
          <Pressable
            style={
              formType === "student"
                ? styles.active_button
                : styles.default_button
            }
            onPress={() => setFormType("student")}
          >
            <Text
              style={
                formType === "student"
                  ? styles.active_button_text
                  : styles.default_button_text
              }
            >
              Student
            </Text>
          </Pressable>
        </View>
      </View>

      {step === "requestOTP" ? (
        formType === "others" ? (
          <>
            {/* others */}
            <View>
              <Text style={styles.text}>Phone number:</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                autoFocus
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              <Pressable
                style={styles.main_button}
                onPress={() =>
                  requestOtp.mutate({
                    phoneNumber: phone,
                    schoolId: config.schoolId,
                  })
                }
              >
                <Text style={styles.default_button_text}>Request OTP</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {/* student */}
            <View>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 24,
                  marginRight: 24,
                }}
              >
                <View style={{ width: "45%" }}>
                  <Text style={styles.text_class}>Class</Text>
                  <SelectDropdown
                    data={allClassesNames}
                    onSelect={(item, index) => {
                      const Class = classesAndSectionsData?.data?.at(index);
                      setSelectedClass(Class);
                    }}
                    defaultButtonText={"Select Class"}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem;
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                    dropdownIconPosition={"right"}
                    dropdownStyle={styles.dropdown1DropdownStyle}
                    rowStyle={styles.dropdown1RowStyle}
                    rowTextStyle={styles.dropdown1RowTxtStyle}
                  />
                </View>
                <View style={{ width: "45%", marginLeft: 10 }}>
                  <Text style={styles.text_class}>Section</Text>
                  <SelectDropdown
                    data={allSections}
                    onSelect={(item, index) => {
                      const section = selectedClass?.Sections.at(index);
                      setSelectedSection(section);
                    }}
                    defaultButtonText={"Select Sections"}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem;
                    }}
                    rowTextForSelection={(item, index) => {
                      return item;
                    }}
                    buttonStyle={styles.dropdown1BtnStyle}
                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                    dropdownIconPosition={"right"}
                    dropdownStyle={styles.dropdown1DropdownStyle}
                    rowStyle={styles.dropdown1RowStyle}
                    rowTextStyle={styles.dropdown1RowTxtStyle}
                  />
                </View>
              </View>
              <View style={{}}>
                <Text style={styles.text}>Roll number:</Text>
                <TextInput
                  style={styles.input}
                  value={rollnum?.toString()}
                  onChangeText={(r) => setRollNo(parseInt(r, 10))}
                  placeholder="Roll number"
                  autoFocus
                  keyboardType="number-pad"
                />
                {insufficientData && (
                  <Text style={styles.text}> Please fill all the values</Text>
                )}
                <Pressable
                  style={styles.main_button}
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
                  <Text style={styles.default_button_text}>Request OTP</Text>
                </Pressable>
              </View>
            </View>
          </>
        )
      ) : (
        <OtpPopup
          visible={true}
          userId={userId}
          onClose={() => setStep("requestOTP")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: "row",
  },
  main_button: {
    backgroundColor: "black",
    padding: 10,
    paddingBottom: 16,
    margin: 10,
    marginRight: 20,
    marginLeft: 20,
    borderWidth: 1,
    borderRadius: 15,
  },
  class_Section: {
    flexGrow: 1,
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    height: 55,
    backgroundColor: "black",
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
  text: {
    color: "black",
    paddingTop: 6,
    paddingLeft: 24,
    fontSize: 18,
  },
  text_class: {
    color: "black",
    paddingTop: 6,
    paddingBottom: 8,
    fontSize: 18,
  },
  default_button_text: {
    color: "white",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 18,
  },
  active_button_text: {
    color: "black",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    width: "90%",
    padding: 10,
    paddingLeft: 16,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 15,
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
  },
  dropdown1BtnTxtStyle: { color: "#858585", textAlign: "left", fontSize: 14 },
  dropdown1DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdown1RowTxtStyle: { color: "#2A2A2A", textAlign: "left" },
});
