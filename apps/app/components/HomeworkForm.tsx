import { useState } from "react";
import { View, Text, ScrollView, List } from "./Themed";
import DatePicker from "react-native-date-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useFileUpload } from "../utils/file-upload";
import type {
  ClassWithSections,
  Homework,
  RouterInput,
  UploadedFile,
} from "schooltalk-shared/types";
import ModalSelector from "react-native-modal-selector";
import { FAB, ListItem } from "@rneui/themed";
import MIMEType from "whatwg-mimetype";
import { format, parseISO } from "date-fns";
import Toast from "react-native-toast-message";
import { useConfig } from "../utils/config";
import { trpc } from "../utils/trpc";
import useColorScheme from "../utils/useColorScheme";
import { ModalTextInput } from "./ModalTextInput";
import { PendingAttachment } from "./attachments/PendingAttachment";
import { FilePreview, FullScreenFilePreview } from "./attachments/FilePreview";

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
  isSubmitting: boolean;
}
export default function HomeworkForm({
  homework,
  onSubmit,
  style,
  isSubmitting,
}: HomeworkFormProps) {
  const config = useConfig();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  const ChevronIcon = (
    <MaterialCommunityIcons name="chevron-right" color={iconColor} size={16} />
  );

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

  // Image preview
  const fileUploadHandler = useFileUpload();
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);

  const [pressedFileId, setPressedFileId] = useState<string | null>(null);
  const handleFilePress = (file: UploadedFile, index: number) => {
    const mime = file.mime ? MIMEType.parse(file.mime) : null;

    if (mime?.type === "image") {
      setPressedFileId(file.id);
    }
  };

  return (
    <>
      <ScrollView style={[styles.container, style]}>
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
            {ChevronIcon}
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
            {ChevronIcon}
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
            {ChevronIcon}
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
                {dueDate
                  ? format(dueDate, "MMM dd, yyyy hh:mm aaa")
                  : "No due date"}
              </ListItem.Subtitle>
            </ListItem.Content>
            {ChevronIcon}
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
              <ListItem.Title>Description (optional)</ListItem.Title>
              <ListItem.Subtitle>{textContent || "Empty"}</ListItem.Subtitle>
            </ListItem.Content>
            {ChevronIcon}
          </ListItem>
        </Pressable>

        {/* upload */}
        <View
          style={{
            flexDirection: "row",
            margin: 16,
            justifyContent: "space-around",
          }}
        >
          <Pressable
            onPress={() => fileUploadHandler.pickAndUploadFile()}
            style={({ pressed }) => [
              { opacity: pressed ? 0.7 : 1, alignItems: "center" },
            ]}
          >
            <MaterialCommunityIcons name="upload" size={25} color={iconColor} />
            <Text>Upload File</Text>
          </Pressable>

          <Pressable
            onPress={() => fileUploadHandler.pickAndUploadCamera()}
            style={({ pressed }) => [
              { opacity: pressed ? 0.7 : 1, alignItems: "center" },
            ]}
          >
            <MaterialCommunityIcons name="camera" size={25} color={iconColor} />
            <Text>Open camera</Text>
          </Pressable>
        </View>

        {/* Pending attachments */}
        {fileUploadHandler.uploadTasks.length > 0 && (
          <View style={{ padding: 8 }}>
            <List
              horizontal
              estimatedItemSize={200}
              data={fileUploadHandler.uploadTasks}
              contentContainerStyle={styles.pending_attachments_list}
              renderItem={({ item }) => <PendingAttachment uploadTask={item} />}
            />
          </View>
        )}

        {/* Existing files */}
        {homework?.Attachments && homework.Attachments.length > 0 && (
          <View style={{ padding: 8, minHeight: 500 }}>
            <List
              estimatedItemSize={200}
              data={homework.Attachments.map((att) => ({
                attachment: att,
                isToBeRemoved: removedFiles.includes(att.file_id),
              }))}
              contentContainerStyle={styles.pending_attachments_list}
              renderItem={({ item: { attachment, isToBeRemoved }, index }) => {
                return (
                  <FilePreview
                    fileIdOrObject={attachment.File}
                    index={index}
                    style={{
                      marginBottom: 8,
                      borderColor: isToBeRemoved ? "red" : iconColor,
                      // borderWidth: 2,
                    }}
                    onPress={handleFilePress}
                    downloadable={false}
                    actions={
                      isToBeRemoved ? (
                        <Pressable
                          style={({ pressed }) => [
                            styles.action_btn,
                            { opacity: pressed ? 0.5 : 1 },
                          ]}
                          onPress={() =>
                            setRemovedFiles((f) => {
                              const isToBeRemoved = f.includes(
                                attachment.file_id,
                              );
                              if (isToBeRemoved) {
                                return f.filter(
                                  (id) => id !== attachment.file_id,
                                );
                              } else {
                                return f;
                              }
                            })
                          }
                        >
                          <MaterialCommunityIcons
                            name="recycle"
                            size={24}
                            color="green"
                          />
                          <Text>Restore</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={({ pressed }) => [
                            styles.action_btn,
                            { opacity: pressed ? 0.5 : 1 },
                          ]}
                          onPress={() =>
                            setRemovedFiles((f) => {
                              const isToBeRemoved = f.includes(
                                attachment.file_id,
                              );
                              if (isToBeRemoved) {
                                return f;
                              } else {
                                return f.concat(attachment.file_id);
                              }
                            })
                          }
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={24}
                            color="red"
                          />
                          <Text>Remove</Text>
                        </Pressable>
                      )
                    }
                  />
                );
              }}
            />
          </View>
        )}

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

        <View style={styles.bottom_margin} />
      </ScrollView>

      {/* Text editor modal */}
      <ModalTextInput
        isVisible={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onChange={setTextContent}
        defaultValue={textContent}
        title="Homework description"
      />

      <FAB
        onPress={() => {
          if (
            selectedSection &&
            selectedClass &&
            selectedSubject &&
            fileUploadHandler.allDone
          ) {
            onSubmit({
              class_id: selectedClass.numeric_id,
              section_id: selectedSection,
              subject_id: selectedSubject,
              due_date: dueDate,
              text: textContent,
              new_file_permissions: fileUploadHandler.uploadTasks.map(
                (task) => ({
                  permission_id: task.permission.id,
                  file_name: task.file.name,
                }),
              ),
              remove_attachments: removedFiles,
            });
            fileUploadHandler.removeAll();
          } else {
            Toast.show({
              type: "error",
              text1: "Please provide all information",
            });
          }
        }}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        icon={
          isSubmitting ? (
            <ActivityIndicator size={24} color="white" />
          ) : (
            <MaterialCommunityIcons name="check" size={24} color={"white"} />
          )
        }
        placement="right"
      />

      <FullScreenFilePreview
        files={homework?.Attachments?.map((att) => att.File) ?? []}
        visible={!!pressedFileId}
        initialFileId={pressedFileId}
        onClose={() => setPressedFileId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  pending_attachments_list: {
    backgroundColor: "transparent",
  },
  bottom_margin: {
    height: 64,
  },
  action_btn: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
