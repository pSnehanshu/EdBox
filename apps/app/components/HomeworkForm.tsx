import { useState } from "react";
import { View, Text, TextInput } from "./Themed";
import DatePicker from "react-native-date-picker";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useFileUpload } from "../utils/file-upload";
import type {
  ClassWithSections,
  Homework,
  RouterInput,
} from "schooltalk-shared/types";
import { useConfig } from "../utils/config";
import { trpc } from "../utils/trpc";
import { parseISO } from "date-fns";

interface HomeworkFormData {
  class_id: number;
  section_id: number;
  subject_id: string;
  text?: string;
  due_date?: Date;
  remove_attachments?: RouterInput["school"]["homework"]["update"]["remove_attachments"];
  new_file_permissions?: RouterInput["school"]["homework"]["update"]["new_file_permissions"];
}

interface HomeworkFormProps {
  homework?: Homework;
  onSubmit: (data: HomeworkFormData) => void;
}
export default function HomeworkForm({
  homework,
  onSubmit,
}: HomeworkFormProps) {
  const config = useConfig();

  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState(homework?.section_id);
  const [selectedSubject, setSelectedSubject] = useState(homework?.subject_id);
  const [textContent, setTextContent] = useState(homework?.text ?? "");
  const [dueDate, setDueDate] = useState(
    homework?.due_date ? parseISO(homework.due_date) : undefined,
  );

  const fileUploadHandler = useFileUpload();
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // class Section and subject data
  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: config.schoolId },
      {
        cacheTime: 0,
        onSuccess(data) {
          // Initialize selected class and section
          setSelectedClass((c) => {
            if (c) return c;
            return data.find((d) => d.numeric_id === homework?.class_id);
          });
        },
      },
    );

  // subjects
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});

  // Default values
  const defaultClassIndex = classesAndSectionsData.data?.findIndex(
    (c) => c.numeric_id === homework?.class_id,
  );
  const defaultSectionIndex = classesAndSectionsData.data
    ?.at(defaultClassIndex ?? 0)
    ?.Sections.findIndex((s) => s.numeric_id === homework?.section_id);
  const defaultSubjectIndex = subjectsQuery.data?.findIndex(
    (s) => s.id === homework?.subject_id,
  );

  return (
    <>
      {/* form */}
      <View>
        <View style={{ width: "50%" }}>
          <Text>Class</Text>
          <SelectDropdown
            data={classesAndSectionsData.data ?? []}
            onSelect={(item) => {
              setSelectedClass(item);
              setSelectedSection(undefined);
            }}
            defaultButtonText={"Select Class"}
            defaultValueByIndex={defaultClassIndex}
            buttonTextAfterSelection={(selectedItem) =>
              `Class ${selectedItem.name ?? selectedItem.numeric_id.toString()}`
            }
            rowTextForSelection={(item) =>
              `Class ${item.name ?? item.numeric_id.toString()}`
            }
            dropdownIconPosition={"right"}
            renderDropdownIcon={(isOpened) => (
              <FontAwesome
                name={isOpened ? "chevron-up" : "chevron-down"}
                color={"#444"}
                size={18}
              />
            )}
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
            data={selectedClass?.Sections ?? []}
            disabled={!selectedClass}
            onSelect={(item) => setSelectedSection(item.numeric_id)}
            defaultButtonText={"Select Sections"}
            defaultValueByIndex={defaultSectionIndex}
            buttonTextAfterSelection={(selectedItem) =>
              `Section ${selectedItem.name ?? selectedItem.numeric_id}`
            }
            rowTextForSelection={(item) =>
              `Section ${item.name ?? item.numeric_id}`
            }
            dropdownIconPosition={"right"}
            renderDropdownIcon={(isOpened) => (
              <FontAwesome
                name={isOpened ? "chevron-up" : "chevron-down"}
                color={"#444"}
                size={18}
              />
            )}
            // buttonStyle={styles.dropdown1BtnStyle}
            // buttonTextStyle={styles.dropdown1BtnTxtStyle}
            // dropdownStyle={styles.dropdown1DropdownStyle}
            // rowStyle={styles.dropdown1RowStyle}
            // rowTextStyle={styles.dropdown1RowTxtStyle}
          />
        </View>
      </View>
      <View>
        <>
          <Text>Subject</Text>

          <SelectDropdown
            data={subjectsQuery.data ?? []}
            onSelect={(item) => setSelectedSubject(item.id)}
            defaultButtonText={"Select Subject"}
            defaultValueByIndex={defaultSubjectIndex}
            buttonTextAfterSelection={(selectedItem) => selectedItem.name}
            rowTextForSelection={(item) => item.name}
            dropdownIconPosition={"right"}
            renderDropdownIcon={(isOpened) => (
              <FontAwesome
                name={isOpened ? "chevron-up" : "chevron-down"}
                color={"#444"}
                size={18}
              />
            )}
            // buttonStyle={styles.dropdown1BtnStyle}
            // buttonTextStyle={styles.dropdown1BtnTxtStyle}
            // dropdownStyle={styles.dropdown1DropdownStyle}
            // rowStyle={styles.dropdown1RowStyle}
            // rowTextStyle={styles.dropdown1RowTxtStyle}
          />
        </>

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
          value={textContent ?? ""}
          onChangeText={setTextContent}
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
          <Text>{dueDate?.toLocaleDateString() ?? "Select a date"}</Text>
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
              onPress={() => fileUploadHandler.pickAndUploadFile()}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="cloud-upload-sharp" size={25} color="white" />
            </Pressable>
            <Text>Upload File</Text>
          </View>

          <View>
            <Pressable
              onPress={() => fileUploadHandler.pickAndUploadCamera()}
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
          date={dueDate ?? new Date()}
          mode="datetime"
          title="Select due date"
          // theme={color}
          minimumDate={new Date()}
          onConfirm={(date) => {
            setDueDate(date);
            setDatePickerVisible(false);
          }}
          onCancel={() => {
            setDatePickerVisible(false);
          }}
        />
        <Pressable
          onPress={() => {
            if (selectedSection && selectedClass && selectedSubject) {
              onSubmit({
                class_id: selectedClass.numeric_id,
                section_id: selectedSection,
                subject_id: selectedSubject,
                due_date: dueDate,
                text: textContent,
                // new_file_permissions,
                // remove_attachments,
              });
            } else {
              console.log("Select all data", {
                selectedSection,
                selectedClass,
                selectedSubject,
              });
            }
          }}
        >
          <Text>{homework ? "Update" : "Create"}</Text>
        </Pressable>
      </View>
    </>
  );
}
