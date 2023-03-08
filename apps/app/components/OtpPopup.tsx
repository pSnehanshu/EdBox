import React, { useState } from "react";
import { Dialog } from "@rneui/themed";
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
import { useSchool } from "../utils/useSchool";

interface props {
  otp: string;
  visible: boolean;
  // setOTP: any;
  setOTP: (otp: string) => void;
  userId: string | null;
}

export default function OtpPopup({ otp, visible, setOTP, userId }: props) {
  const setAuthToken = useSetAuthToken();
  const school = useSchool();
  const [modalVisible, setModalVisible] = useState(false);

  const submitOTP = trpc.auth.submitLoginOTP.useMutation({
    onSuccess(data) {
      setAuthToken(data.token, new Date(data.expiry_date));
    },
  });
  if (!school) return null;
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.mainText}>Verification Code</Text>
            <Text style={styles.subText}>
              We have send the code to your/your parents Mobile No
            </Text>
            <Text style={styles.subText}>+91-********89</Text>
            <TextInput
              style={styles.inputText}
              // onChangeText={onChangeText}
              // value={text}
              autoFocus
              keyboardType="number-pad"
              maxLength={5}
            />
            <Pressable
              style={styles.button}
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
            >
              <Text style={styles.textStyle}>Submit</Text>
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
    // shadowColor: "",
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
    marginBottom: 24,
    backgroundColor: Colors.semi_black,
    width: "70%",
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
    margin: 12,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    width: "70%",
    letterSpacing: 25,
    textAlign: "center",
  },
});
