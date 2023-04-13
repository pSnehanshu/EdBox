import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput } from "./Themed";
import DatePicker from "react-native-date-picker";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useFileUpload } from "../utils/file-upload";
import {
  ClassWithSections,
  Homework,
  Section,
  Subject,
} from "schooltalk-shared/types";
import useColorScheme from "../utils/useColorScheme";
import { useConfig } from "../utils/config";
import { trpc } from "../utils/trpc";

interface HomeworkFormProps {
  homework?: Homework;
  //   onPress: () => void;
}
export default function HomeworkForm({ homework }: HomeworkFormProps) {
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

  console.log(JSON.stringify(homework, null, 2));

  useEffect(() => {
    if (homework) {
      setTextContent(homework.text ?? "");
    }
  }, [homework]);

  // mutation
  const createHomework = trpc.school.homework.create.useMutation({
    onSuccess(data) {
      // alert(JSON.stringify(data, null, 2));
      // onClose();
    },
    onError(error, variables, context) {
      alert(error);
    },
  });

  const updateHomework = trpc.school.homework.update.useMutation({
    onSuccess(data) {
      // onClose();
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
    <View>
      <View>
        <View>
          <View />
          {/* form */}
          <View>
            <View>
              <View style={{ width: "50%" }}>
                <Text>Class</Text>
                <SelectDropdown
                  data={allClassesNames}
                  onSelect={(item, index) => {
                    //   const Class = classesAndSectionsData?.data?.at(index);
                    //   setSelectedClass(Class);
                  }}
                  // defaultValueByIndex={homeworkFormData.class_id ?? -1}
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
                  // buttonStyle={styles.dropdown1BtnStyle}
                  // buttonTextStyle={styles.dropdown1BtnTxtStyle}
                  // dropdownStyle={styles.dropdown1DropdownStyle}
                  // rowStyle={styles.dropdown1RowStyle}
                  // rowTextStyle={styles.dropdown1RowTxtStyle}
                />
              </View>
              <View style={{ width: "50%", marginLeft: 10 }}>
                <Text>Section</Text>

                <SelectDropdown
                  data={allSections}
                  // disabled={allSections.length === 0}
                  onSelect={(item, index) => {
                    //   const section = selectedClass?.Sections.at(index);
                    //   setSelectedSection(section);
                  }}
                  // defaultValueByIndex={homeworkFormData.section_id - 1 ?? -1}
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
                  // buttonStyle={styles.dropdown1BtnStyle}
                  // buttonTextStyle={styles.dropdown1BtnTxtStyle}
                  // dropdownStyle={styles.dropdown1DropdownStyle}
                  // rowStyle={styles.dropdown1RowStyle}
                  // rowTextStyle={styles.dropdown1RowTxtStyle}
                />
              </View>
            </View>
          </View>
          <View>
            <Text>Subject</Text>

            <SelectDropdown
              data={allSubjectsName}
              onSelect={(item, index) => {
                //   const subject = allSubject?.data?.at(index);
                //   setSelectedSubject(subject);
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
              // buttonStyle={styles.dropdown1BtnStyle}
              // buttonTextStyle={styles.dropdown1BtnTxtStyle}
              // dropdownStyle={styles.dropdown1DropdownStyle}
              // rowStyle={styles.dropdown1RowStyle}
              // rowTextStyle={styles.dropdown1RowTxtStyle}
            />

            <Text>Text</Text>

            <TextInput
              style={{
                height: 100,
                marginBottom: 5,
                borderWidth: 1,
                borderRadius: 15,
                textAlignVertical: "top",
                paddingTop: 12,
                padding: 20,
                color: "#2A2A2A",
              }}
              multiline
              maxLength={100}
              value={textContent}
              // onChangeText={setTextContent}
            />
            <Text>Due date</Text>
            <Pressable
              style={{
                backgroundColor: "gray",
                borderRadius: 15,
                padding: 15,
                marginBottom: 12,
              }}
              onPress={() => setDatePickerVisible((v) => !v)}
            >
              <Text>{date?.toLocaleDateString() ?? "Select a date"}</Text>
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
                  // onPress={() => fileUpload.pickAndUploadFile()}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="cloud-upload-sharp" size={25} color="white" />
                </Pressable>
                <Text>Upload File</Text>
              </View>

              <View>
                <Pressable
                  // onPress={() => fileUpload.pickAndUploadCamera()}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="camera" size={25} color="white" />
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
              // theme={color}
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
            // onPress={() => {
            //   if (
            //     selectedSection &&
            //     selectedClass &&
            //     selectedSubject &&
            //     date
            //   ) {
            //     createHomework.mutate({
            //       text: textContent,
            //       section_id: selectedSection?.numeric_id,
            //       class_id: selectedClass?.numeric_id,
            //       subject_id: selectedSubject?.id,
            //       due_date: date.toISOString(),
            //       // file_permissions: FilePermissionsSchema.array().default([]),
            //     });
            //   }
            // }}
            >
              <Text>{!homework ? "Create" : "Update"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
