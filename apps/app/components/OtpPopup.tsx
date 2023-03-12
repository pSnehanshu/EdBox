import React, { useState } from "react";
import Colors from "../constants/Colors";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
} from "react-native";
import { trpc } from "../utils/trpc";
import { useSetAuthToken } from "../utils/auth";
import config from "../config";
import Spinner from "react-native-loading-spinner-overlay";

interface props {
  visible: boolean;
  userId: string | null;
  onClose?: () => void;
  formType: string;
}

export default function OtpPopup({
  visible,
  userId,
  onClose,
  formType,
}: props) {
  const setAuthToken = useSetAuthToken();
  const [otp, setOtp] = useState<string | null>(null);

  const submitOTP = trpc.auth.submitLoginOTP.useMutation({
    onSuccess(data) {
      setAuthToken(data.token, new Date(data.expiry_date));
    },
    onError(error, variables, context) {
      console.error(error);
      Alert.alert("Invalid OTP", "Looks like the OTP you entered is incorrect");
      setOtp(null);
    },
  });

  return (
    <View style={styles.centeredView}>
      <Spinner visible={submitOTP.isLoading} textContent="Please wait..." />
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => onClose?.()}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.mainText}>Verification Code</Text>
            <Text style={styles.subText}>
              We have send the code to your
              {formType === "others" ? "parents" : ""} Mobile No
            </Text>

            <TextInput
              style={styles.inputText}
              value={otp ?? ""}
              onChangeText={setOtp}
              autoFocus
              keyboardType="number-pad"
              maxLength={6}
            />
            <Pressable
              style={styles.button}
              onPress={() => {
                if (userId && otp) {
                  submitOTP.mutate({
                    userId,
                    otp,
                    schoolId: config.schoolId,
                  });
                }
              }}
            >
              <Text style={styles.textStyle}>Submit</Text>
            </Pressable>
            <Pressable onPress={() => onClose?.()}>
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: "rgba(255, 255, 255, .7)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 35,
    alignItems: "center",
    width: "90%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.semi_black,
    width: "90%",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  mainText: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
  },
  inputText: {
    height: 40,
    margin: 16,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    width: "90%",
    letterSpacing: 25,
    textAlign: "center",
  },
});
