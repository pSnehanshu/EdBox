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
  Homework,
  RouterInput,
  UploadedFile,
} from "schooltalk-shared/types";
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
import { CustomSelect } from "./CustomSelect";

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

  const [selectedClass, setSelectedClass] = useState(homework?.Class);
  const [selectedSection, setSelectedSection] = useState(homework?.Section);
  const [selectedSubject, setSelectedSubject] = useState(homework?.Subject);
  const [textContent, setTextContent] = useState(homework?.text ?? "");
  const [dueDate, setDueDate] = useState(
    homework?.due_date ? parseISO(homework.due_date) : undefined,
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // class Section and subject data
  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery({
      schoolId: config.schoolId,
    });

  const availableSections = classesAndSectionsData.data?.find(
    (Class) => Class.numeric_id === selectedClass?.numeric_id,
  )?.Sections;

  // subjects
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});

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
        <CustomSelect
          isSingle
          items={classesAndSectionsData.data}
          isLoading={classesAndSectionsData.isLoading}
          selected={selectedClass}
          title="Class"
          idExtractor={(item) => item.numeric_id}
          labelExtractor={(item) => `Class ${item.name ?? item.numeric_id}`}
          onSubmit={(item) => {
            setSelectedClass(item);
            setSelectedSection(undefined);
          }}
        />

        <CustomSelect
          isSingle
          items={availableSections}
          isLoading={classesAndSectionsData.isLoading}
          selected={selectedSection}
          title="Section"
          idExtractor={(item) => item.numeric_id}
          labelExtractor={(item) => `Section ${item.name ?? item.numeric_id}`}
          onSubmit={(item) => setSelectedSection(item)}
        />

        <CustomSelect
          isSingle
          items={subjectsQuery.data}
          isLoading={subjectsQuery.isLoading}
          selected={selectedSubject}
          title="Subject"
          idExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          onSubmit={(item) => setSelectedSubject(item)}
        />

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
            <ListItem.Chevron />
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
            <ListItem.Chevron />
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
              section_id: selectedSection.numeric_id,
              subject_id: selectedSubject.id,
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
