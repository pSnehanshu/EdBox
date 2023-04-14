import { useState } from "react";
import { View, Text, ScrollView } from "./Themed";
import DatePicker from "react-native-date-picker";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { useFileUpload } from "../utils/file-upload";
import type {
  ClassWithSections,
  Homework,
  RouterInput,
} from "schooltalk-shared/types";
import ModalSelector from "react-native-modal-selector";
import { FAB, ListItem } from "@rneui/themed";
import { useConfig } from "../utils/config";
import { trpc } from "../utils/trpc";
import { parseISO } from "date-fns";
import useColorScheme from "../utils/useColorScheme";
import { ModalTextInput } from "./ModalTextInput";

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
  style?: StyleProp<ViewStyle>;
}
export default function HomeworkForm({
  homework,
  onSubmit,
  style,
}: HomeworkFormProps) {
  const config = useConfig();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState(homework?.section_id);
  const selectedSectionObject = selectedClass?.Sections?.find(
    (s) => s.numeric_id === selectedSection,
  );

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
  const selectedSubjectObject = subjectsQuery.data?.find(
    (s) => s.id === selectedSubject,
  );

  return (
    <>
      <ScrollView style={style} keyboardShouldPersistTaps="always">
        <ModalSelector
          data={
            classesAndSectionsData.data?.map((c) => ({
              key: c.numeric_id,
              label: `Class ${c.name ?? c.numeric_id.toString()}`,
            })) ?? []
          }
          onChange={(item) => {
            const Class = classesAndSectionsData.data?.find(
              (c) => c.numeric_id === item.key,
            );
            setSelectedClass(Class);
            setSelectedSection(undefined);
          }}
          animationType="fade"
          selectedKey={selectedClass?.numeric_id}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Class</ListItem.Title>
              <ListItem.Subtitle>
                {selectedClass
                  ? `Class ${selectedClass.name ?? selectedClass.numeric_id}`
                  : "Select class"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <Ionicons name="chevron-forward" color={iconColor} size={16} />
          </ListItem>
        </ModalSelector>

        <ModalSelector
          data={
            selectedClass?.Sections.map((s) => ({
              key: s.numeric_id,
              label: `Section ${s.name ?? s.numeric_id}`,
            })) ?? []
          }
          disabled={!selectedClass}
          onChange={(item) => setSelectedSection(item.key)}
          animationType="fade"
          selectedKey={selectedSection}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Section</ListItem.Title>
              <ListItem.Subtitle>
                {selectedSectionObject
                  ? `Section ${
                      selectedSectionObject.name ??
                      selectedSectionObject.numeric_id
                    }`
                  : "Select section"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <Ionicons name="chevron-forward" color={iconColor} size={16} />
          </ListItem>
        </ModalSelector>

        <ModalSelector
          data={
            subjectsQuery.data?.map((sub) => ({
              key: sub.id,
              label: sub.name,
            })) ?? []
          }
          onChange={(item) => setSelectedSubject(item.key)}
          animationType="fade"
          selectedKey={selectedSubject}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Subject</ListItem.Title>
              <ListItem.Subtitle>
                {selectedSubjectObject?.name ?? "Select subject"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <Ionicons name="chevron-forward" color={iconColor} size={16} />
          </ListItem>
        </ModalSelector>

        <Pressable
          onPress={() => setDatePickerVisible((v) => !v)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.2 : 1,
          })}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Due date (optional)</ListItem.Title>
              <ListItem.Subtitle>
                {dueDate?.toLocaleDateString() ?? "No due date"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <Ionicons name="chevron-forward" color={iconColor} size={16} />
          </ListItem>
        </Pressable>

        <Pressable
          onPress={() => setIsTextModalOpen(true)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.2 : 1,
          })}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Text</ListItem.Title>
              <ListItem.Subtitle>{textContent || "Empty"}</ListItem.Subtitle>
            </ListItem.Content>
            <Ionicons name="chevron-forward" color={iconColor} size={16} />
          </ListItem>
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
              <Ionicons name="cloud-upload-sharp" size={25} color={iconColor} />
            </Pressable>
            <Text>Upload File</Text>
          </View>

          <View>
            <Pressable
              onPress={() => fileUploadHandler.pickAndUploadCamera()}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="camera" size={25} color={iconColor} />
            </Pressable>

            <Text>Take Photo</Text>
          </View>
        </View>

        {/* Text editor modal */}
        <ModalTextInput
          isVisible={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          onChange={setTextContent}
          defaultValue={textContent}
          title="Write the homework"
        />

        {/* due date datepicker */}
        <DatePicker
          modal
          open={datePickerVisible}
          date={dueDate ?? new Date()}
          mode="datetime"
          title="Select due date"
          theme={scheme}
          minimumDate={new Date()}
          onConfirm={(date) => {
            setDueDate(date);
            setDatePickerVisible(false);
          }}
          onCancel={() => {
            setDatePickerVisible(false);
          }}
        />
      </ScrollView>

      <FAB
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
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        icon={<Ionicons name="checkmark" size={24} color={"white"} />}
        placement="right"
      />
    </>
  );
}
