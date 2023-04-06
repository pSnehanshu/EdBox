import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { RootStackParamList } from "../utils/types/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, TextInput, View } from "../components/Themed";
import { FAB } from "@rneui/themed";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Modal } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { trpc } from "../utils/trpc";
import useColorScheme from "../utils/useColorScheme";

type Props = {};

export default function HomeWorkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "HomeWorkScreen"
>) {
  const [createHomeWorkModal, setCreateHomeWorkModal] = useState(false);

  const homeworkQuery = trpc.school.homework.fetchForTeacher.useQuery({
    limit: 10,
  });
  const color = useColorScheme();
  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      {/* list */}
      <Text>{JSON.stringify(homeworkQuery.data, null, 2)}</Text>
      <FAB
        icon={
          <Ionicons
            name="add"
            size={24}
            color={color === "dark" ? "black" : "white"}
          />
        }
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 100,
          elevation: 1,
          flex: 1,
        }}
        color={color === "dark" ? "white" : "black"}
        onPress={() => setCreateHomeWorkModal(true)}
        // title={""}
      />
      <EditHomeWorkModal
        createHomeWorkModal={createHomeWorkModal}
        onClose={() => setCreateHomeWorkModal((prev) => !prev)}
        color={color}
      />
    </View>
  );
}

interface props {
  createHomeWorkModal: boolean;
  onClose: () => void;
  color: string;
}

function EditHomeWorkModal({ createHomeWorkModal, onClose, color }: props) {
  const blurBg = color === "dark" ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)";
  return (
    <View style={styles.centeredView}>
      <Modal
        transparent={true}
        visible={createHomeWorkModal}
        onRequestClose={onClose}
      >
        <FAB
          icon={
            <Ionicons
              name="close"
              size={24}
              color={color === "dark" ? "black" : "white"}
            />
          }
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            zIndex: 100,
            elevation: 1,
            flex: 1,
          }}
          color={color === "dark" ? "white" : "black"}
          onPress={onClose}
        />
        <View style={[styles.centeredView, { backgroundColor: blurBg }]}>
          <View
            style={[
              styles.modalView,
              {
                borderColor: "white",
                borderWidth: 2,
              },
            ]}
          >
            <Text style={styles.mainText}>Create new Home Work</Text>
            <View
              style={{
                borderBottomColor: "black",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                // marginLeft: 24,
                marginRight: 24,
              }}
            >
              <View style={{ width: "50%" }}>
                <Text style={styles.text_class}>Class</Text>
                <SelectDropdown
                  data={["class1", "class2"]}
                  onSelect={(item, index) => {}}
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
                  renderDropdownIcon={(isOpened) => {
                    return (
                      <FontAwesome
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        color={"#444"}
                        size={18}
                      />
                    );
                  }}
                  dropdownStyle={styles.dropdown1DropdownStyle}
                  rowStyle={styles.dropdown1RowStyle}
                  rowTextStyle={styles.dropdown1RowTxtStyle}
                />
              </View>
              <View style={{ width: "50%", marginLeft: 10 }}>
                <Text style={styles.text_class}>Section</Text>
                <SelectDropdown
                  data={["Sec1", "Sec2"]}
                  //   disabled={}
                  onSelect={(item, index) => {}}
                  defaultButtonText={"Select Sections"}
                  buttonTextAfterSelection={(selectedItem, index) => {
                    return selectedItem;
                  }}
                  rowTextForSelection={(item, index) => {
                    return item;
                  }}
                  dropdownIconPosition={"right"}
                  renderDropdownIcon={(isOpened) => {
                    return (
                      <FontAwesome
                        name={isOpened ? "chevron-up" : "chevron-down"}
                        color={"#444"}
                        size={18}
                      />
                    );
                  }}
                  buttonStyle={styles.dropdown1BtnStyle}
                  buttonTextStyle={styles.dropdown1BtnTxtStyle}
                  dropdownStyle={styles.dropdown1DropdownStyle}
                  rowStyle={styles.dropdown1RowStyle}
                  rowTextStyle={styles.dropdown1RowTxtStyle}
                />
              </View>
            </View>
            <View>
              <Text style={styles.text_class}>Subject</Text>
              <SelectDropdown
                data={["Sec1", "Sec2"]}
                //   disabled={}
                onSelect={(item, index) => {}}
                defaultButtonText={"Select Sections"}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  return item;
                }}
                dropdownIconPosition={"right"}
                renderDropdownIcon={(isOpened) => {
                  return (
                    <FontAwesome
                      name={isOpened ? "chevron-up" : "chevron-down"}
                      color={"#444"}
                      size={18}
                    />
                  );
                }}
                buttonStyle={styles.dropdown1BtnStyle}
                buttonTextStyle={styles.dropdown1BtnTxtStyle}
                dropdownStyle={styles.dropdown1DropdownStyle}
                rowStyle={styles.dropdown1RowStyle}
                rowTextStyle={styles.dropdown1RowTxtStyle}
              />
            </View>
            <Text style={styles.text_class}>Text</Text>
            <TextInput
              style={styles.inputText}
              editable
              multiline
              numberOfLines={3}
              maxLength={100}
              //   value={""}
              //   autoFocus
            />

            <Pressable style={styles.button}>
              <Text style={styles.textStyle}>Create</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "transparent",
  },
  modalView: {
    margin: 20,
    borderRadius: 15,
    padding: 35,
    // alignItems: "center",
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
    backgroundColor: "#4E48B2",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  mainText: {
    textAlign: "left",
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
    height: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 15,
  },
  text_class: {
    paddingTop: 6,
    paddingBottom: 8,
    fontSize: 18,
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
  },
  dropdown1BtnTxtStyle: {
    color: "#858585",
    textAlign: "left",
    fontSize: 14,
  },
  dropdown1DropdownStyle: {
    backgroundColor: "#EFEFEF",
    marginTop: -30,
    borderRadius: 15,
  },
  dropdown1RowStyle: {
    backgroundColor: "white",
    borderBottomColor: "#C5C5C5",
    height: 40,
  },
  dropdown1RowTxtStyle: {
    color: "#2A2A2A",
    textAlign: "center",
  },
});
