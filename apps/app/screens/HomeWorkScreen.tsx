import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { RootStackParamList } from "../utils/types/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text, TextInput, View } from "../components/Themed";
import { Button, FAB } from "@rneui/themed";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Modal, Image } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { trpc } from "../utils/trpc";
import useColorScheme from "../utils/useColorScheme";
import { useConfig } from "../utils/config";
import {
  ClassWithSections,
  Homework,
  Section,
  Subject,
} from "schooltalk-shared/types";
import DatePicker from "react-native-date-picker";
import { useFileUpload } from "../utils/file-upload";
import { format, parseISO } from "date-fns";

export default function HomeWorkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "HomeWorkScreen"
>) {
  const [createHomeWorkModal, setCreateHomeWorkModal] = useState(false);

  const homeworkQuery = trpc.school.homework.fetchForTeacher.useQuery({
    limit: 10,
  });
  const color = useColorScheme();
  const [homeworkFormData, setHomeworkFormData] = useState({});

  const homeworkList = useMemo(() => {
    if (!homeworkQuery.data) return [];

    return homeworkQuery.data.data;
  }, [homeworkQuery]);
  console.log(JSON.stringify(homeworkList, null, 2));
  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      {/* list */}
      {/* {!homeworkQuery.isLoading &&
        homeworkQuery.data?.data.map((homework) => (
          <SingleHomework
            key={homework.id}
            homework={homework}
            openModal={() => setCreateHomeWorkModal(true)}
            setHomeworkFormData={setHomeworkFormData}
          />
        ))}
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
      /> */}
      <SafeAreaView style={{ height: "100%", width: "100%" }}>
        <List
          data={homeworkList}
          keyExtractor={(g) => g.id}
          estimatedItemSize={200}
          renderItem={({ item: item }) => (
            <SingleHomework
              homework={item}
              openModal={() => setCreateHomeWorkModal(true)}
            />
          )}
        />
      </SafeAreaView>
      <EditHomeWorkModal
        createHomeWorkModal={createHomeWorkModal}
        onClose={() => setCreateHomeWorkModal((prev) => !prev)}
        homeworkFormData={homeworkFormData}
        setHomeworkFormData={setHomeworkFormData}
      />
    </View>
  );
}

interface props {
  createHomeWorkModal: boolean;
  onClose: () => void;
  homeworkFormData: any;
  setHomeworkFormData: any;
}

function EditHomeWorkModal({
  createHomeWorkModal,
  onClose,
  homeworkFormData,
  setHomeworkFormData,
}: props) {
  const color = useColorScheme();
  const config = useConfig();
  const fileUpload = useFileUpload();
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<Section>();
  const [selectedSubject, setSelectedSubject] = useState<Subject>();
  const [textContent, setTextContent] = useState<string>();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [date, setDate] = useState<Date>();
  const blurBg = color === "dark" ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.6)";

  // mutation
  const createHomework = trpc.school.homework.create.useMutation({
    onSuccess(data) {
      // alert(JSON.stringify(data, null, 2));
      onClose();
    },
    onError(error, variables, context) {
      alert(error);
    },
  });

  const updateHomework = trpc.school.homework.update.useMutation({
    onSuccess(data) {
      onClose();
    },
    onError(error, variables, context) {
      alert(error);
    },
  });

  // class Section and subject data
  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: config.schoolId },
      { cacheTime: 0 },
    );

  // subjects
  const allSubject = trpc.school.subject.fetchSubjects.useQuery({});

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

  const allSubjectsName = useMemo(
    () => allSubject.data?.map((a) => ` ${a.name ?? a.name}`) ?? [],
    [allSubject.isFetching],
  );

  return (
    <View style={styles.centeredView}>
      <Modal
        transparent={true}
        visible={createHomeWorkModal}
        onRequestClose={onClose}
        animationType="fade"
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
          onPress={() => {
            onClose();
            setHomeworkFormData({});
          }}
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
            {/* form */}
            <View>
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
                    data={allClassesNames}
                    onSelect={(item, index) => {
                      const Class = classesAndSectionsData?.data?.at(index);
                      setSelectedClass(Class);
                    }}
                    defaultValueByIndex={homeworkFormData.class_id ?? -1}
                    defaultButtonText={"Select Class"}
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
                <View style={{ width: "50%", marginLeft: 10 }}>
                  <Text style={styles.text_class}>Section</Text>

                  <SelectDropdown
                    data={allSections}
                    // disabled={allSections.length === 0}
                    onSelect={(item, index) => {
                      const section = selectedClass?.Sections.at(index);
                      setSelectedSection(section);
                    }}
                    defaultValueByIndex={homeworkFormData.section_id - 1 ?? -1}
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
            </View>
            <View>
              <Text style={styles.text_class}>Subject</Text>

              <SelectDropdown
                data={allSubjectsName}
                onSelect={(item, index) => {
                  const subject = allSubject?.data?.at(index);
                  setSelectedSubject(subject);
                }}
                defaultButtonText={"Select Subject"}
                // defaultValueByIndex={3}
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

              <Text style={styles.text_class}>Text</Text>

              <TextInput
                style={styles.inputText}
                multiline
                maxLength={100}
                value={textContent}
                onChangeText={setTextContent}
              />
              <Text style={styles.text_class}>Due date</Text>
              <Pressable
                style={{
                  backgroundColor: "gray",
                  borderRadius: 15,
                  padding: 15,
                  marginBottom: 12,
                }}
                onPress={() => setDatePickerVisible((v) => !v)}
              >
                <Text style={styles.textStyle}>
                  {date?.toLocaleDateString() ?? "Select a date"}
                </Text>
              </Pressable>
              {/* upload */}
              <View
                style={{
                  flexDirection: "row",
                  margin: 14,
                  justifyContent: "space-between",
                  marginLeft: 30,
                  marginRight: 30,
                }}
              >
                <View>
                  <Pressable
                    onPress={() => fileUpload.pickAndUploadFile()}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons
                      name="cloud-upload-sharp"
                      size={25}
                      color="white"
                      style={styles.round_icon}
                    />
                  </Pressable>
                  <Text>Upload File</Text>
                </View>

                <View>
                  <Pressable
                    onPress={() => fileUpload.pickAndUploadCamera()}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons
                      name="camera"
                      size={25}
                      color="white"
                      style={styles.round_icon}
                    />
                  </Pressable>

                  <Text>Take Photo</Text>
                </View>
              </View>

              {/* due date datepicker */}
              <DatePicker
                modal
                open={datePickerVisible}
                date={date ?? new Date()}
                mode="datetime"
                title="Select due date"
                theme={color}
                minimumDate={new Date()}
                onConfirm={(date) => {
                  setDate(date);
                  setDatePickerVisible(false);
                }}
                onCancel={() => {
                  setDatePickerVisible(false);
                }}
              />
              <Pressable
                style={styles.button}
                onPress={() => {
                  if (
                    selectedSection &&
                    selectedClass &&
                    selectedSubject &&
                    date
                  ) {
                    createHomework.mutate({
                      text: textContent,
                      section_id: selectedSection?.numeric_id,
                      class_id: selectedClass?.numeric_id,
                      subject_id: selectedSubject?.id,
                      due_date: date.toISOString(),
                      // file_permissions: FilePermissionsSchema.array().default([]),
                    });
                  }
                }}
              >
                <Text style={styles.textStyle}>
                  {homeworkFormData.id ? "Update" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface HomeworkProps {
  homework: Homework | any;
  openModal: () => void;
}

function SingleHomework({ homework, openModal }: HomeworkProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chatGroup,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.chatGroupMiddle}>
        <Text style={styles.chatGroupName}>{homework.Subject.name}</Text>
        <Text style={styles.chatGroupLastMessage}>
          {homework.text ? homework.text : ""}
        </Text>
      </View>
      <View style={styles.chatGroupRight}>
        <Text style={styles.chatGroupLastMessage}>
          Due-
          {homework.due_date
            ? format(parseISO(homework.due_date), "dd-MM-yyyy")
            : "NA"}
        </Text>
      </View>
      <View>
        {/* <Pressable
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 15,
            paddingLeft: 20,
            paddingRight: 20,
          }}
          onPress={() => {
            openModal();
            // setHomeworkFormData(homework);
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "black" }}>
            View
          </Text>
        </Pressable> */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // test
    backgroundColor: "#4E48B2",
    // flex: 1,
    margin: 10,
    borderRadius: 15,
    paddingVertical: 8,
    paddingLeft: 16,
    shadowColor: "gray",
    shadowRadius: 8,
    shadowOffset: {
      height: 8,
      width: 8,
    },
  },
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
    marginBottom: 5,
    borderWidth: 1,
    borderRadius: 15,
    textAlignVertical: "top",
    paddingTop: 12,
    padding: 20,
    color: "#2A2A2A",
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
    color: "#000",
    textAlign: "left",
    fontSize: 14,
  },
  dropdown1DropdownStyle: {
    backgroundColor: "#EFEFEF",
    marginTop: 0,
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
  round_icon: {
    backgroundColor: "#4E48B2",
    padding: 15,
    alignItems: "center",
    height: 60,
    width: 60,
    borderRadius: 999,
    textAlign: "center",
    justifyContent: "center",
  },
  chatGroup: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    height: 80,
    overflow: "hidden",
  },
  chatGroupMiddle: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingLeft: 16,
    maxWidth: "80%",
  },
  chatGroupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chatGroupRight: {
    backgroundColor: undefined,
    paddingRight: 8,
    marginLeft: "auto",
  },
  chatGroupLastMessage: {
    fontSize: 12,
    color: "gray",
  },
});
