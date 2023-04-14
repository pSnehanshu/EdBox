import { useEffect, useState } from "react";
import { Modal, StyleProp, TextStyle } from "react-native";
import { View, Text, ScrollView, TextInput } from "./Themed";
import DatePicker from "react-native-date-picker";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useFileUpload } from "../utils/file-upload";
import type {
  ClassWithSections,
  Homework,
  RouterInput,
} from "schooltalk-shared/types";
import ModalSelector from "react-native-modal-selector";
import { useConfig } from "../utils/config";
import { trpc } from "../utils/trpc";
import { parseISO } from "date-fns";
import useColorScheme from "../utils/useColorScheme";
import { Button, ListItem, Dialog } from "@rneui/themed";
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
}
export default function HomeworkForm({
  homework,
  onSubmit,
}: HomeworkFormProps) {
  const config = useConfig();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

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

  return (
    <>
      <View>
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
                {selectedClass ? `Class ${selectedClass.name}` : "Select class"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <FontAwesome name="chevron-right" color="#444" size={18} />
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
                {selectedSection
                  ? `Section ${selectedSection}`
                  : "Select section"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <FontAwesome name="chevron-right" color="#444" size={18} />
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
                {selectedSubject ?? "Select subject"}
              </ListItem.Subtitle>
            </ListItem.Content>
            <FontAwesome name="chevron-right" color="#444" size={18} />
          </ListItem>
        </ModalSelector>

        <ListItem onPress={() => setDatePickerVisible((v) => !v)}>
          <ListItem.Content>
            <ListItem.Title>Due date</ListItem.Title>
            <ListItem.Subtitle>
              {dueDate?.toLocaleDateString() ?? "Select date"}
            </ListItem.Subtitle>
          </ListItem.Content>
          <FontAwesome name="chevron-right" color="#444" size={18} />
        </ListItem>

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

        <ListItem onPress={() => setIsTextModalOpen(true)}>
          <ListItem.Content>
            <ListItem.Title>Text</ListItem.Title>
            <ListItem.Subtitle>{textContent}</ListItem.Subtitle>
          </ListItem.Content>
          <FontAwesome name="chevron-right" color="#444" size={18} />
        </ListItem>

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

      <ModalTextInput
        isVisible={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onChange={setTextContent}
        defaultValue={textContent}
        title="Write the homework"
      />
    </>
  );
}
