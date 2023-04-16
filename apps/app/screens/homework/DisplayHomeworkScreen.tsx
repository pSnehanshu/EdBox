import { useEffect, useMemo, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Hyperlink from "react-native-hyperlink";
import { View, Text, ScrollView, List } from "../../components/Themed";
import { RootStackParamList } from "../../utils/types/common";
import {
  StyleSheet,
  ScrollView as RNScrollView,
  Pressable,
  Alert,
} from "react-native";
import { SpeedDial, Card, ListItem } from "@rneui/themed";
import MIMEType from "whatwg-mimetype";
import type { UploadedFile } from "schooltalk-shared/types";
import Spinner from "react-native-loading-spinner-overlay/lib";
import { hasUserStaticRoles, StaticRole } from "schooltalk-shared/misc";
import { format, isPast, parseISO } from "date-fns";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { trpc } from "../../utils/trpc";
import { useCurrentUser } from "../../utils/auth";
import useColorScheme from "../../utils/useColorScheme";
import {
  FilePreview,
  FullScreenFilePreview,
} from "../../components/attachments/FilePreview";

export default function DisplayHomeworkScreen({
  route: {
    params: { homeworkId },
  },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "DisplayHomeworkScreen">) {
  const scheme = useColorScheme();
  const oppColor = scheme === "dark" ? "white" : "black";
  const [isActionOpen, setActionOpen] = useState(false);
  const utils = trpc.useContext();

  // query
  const homeworkQuery = trpc.school.homework.fetchHomework.useQuery({
    homework_id: homeworkId,
  });

  // Delete
  const deleteMutation = trpc.school.homework.delete.useMutation({
    async onSuccess(data, variables, context) {
      await utils.school.homework.fetchForSection.invalidate();
      await utils.school.homework.fetchForTeacher.invalidate();

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace("HomeWorkScreen");
      }
    },
    onError(error, variables, context) {
      //
    },
  });

  const { data: homework } = homeworkQuery;
  const attachmentsCount = homework?.Attachments.length ?? 0;

  useEffect(() => {
    if (homework?.Subject.name) {
      navigation.setOptions({
        title: `${homework?.Subject.name} homework`,
      });
    }
  }, [homework?.Subject.name]);

  const { user } = useCurrentUser();
  const isTeacher = hasUserStaticRoles(user, [StaticRole.teacher], "all");
  const isEditable = isTeacher && user?.teacher_id === homework?.teacher_id;

  const [pressedFileId, setPressedFileId] = useState<string | null>(null);
  const handleFilePress = (file: UploadedFile, index: number) => {
    const mime = file.mime ? MIMEType.parse(file.mime) : null;

    if (mime?.type === "image") {
      setPressedFileId(file.id);
    }
  };

  const dueDate = useMemo(
    () => (homework?.due_date ? parseISO(homework.due_date) : null),
    [homework?.due_date],
  );
  const dueDateStr = useMemo(
    () => (dueDate ? format(dueDate, "MMM dd, yyyy hh:mm aaa") : null),
    [dueDate],
  );
  const dueDatePast = useMemo(
    () => (dueDate ? isPast(dueDate) : false),
    [dueDate],
  );

  // Stuff to scroll to attachments
  const scrollRef = useRef<RNScrollView>(null);
  const [attachmentsYpos, setAttachmentsYpos] = useState<number>();

  return (
    <View style={styles.container}>
      <Spinner visible={homeworkQuery.isLoading || deleteMutation.isLoading} />

      <ScrollView innerRef={scrollRef}>
        <Card>
          {homework?.Teacher?.User && (
            <ListItem>
              <FontAwesome5
                name="chalkboard-teacher"
                size={24}
                color={oppColor}
              />
              <ListItem.Content>
                <ListItem.Title>Teacher</ListItem.Title>
                <ListItem.Subtitle>
                  {/* {getDisplayName(homework.Teacher.User)} */}
                  {homework?.Teacher?.User?.name}
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          )}

          <ListItem>
            <MaterialCommunityIcons
              name="google-classroom"
              size={24}
              color={oppColor}
            />
            <ListItem.Content>
              <ListItem.Title>
                Class {homework?.Class.name ?? homework?.Class.numeric_id} (
                {homework?.Section.name ?? homework?.Section.numeric_id})
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>

          {dueDateStr && (
            <ListItem>
              <FontAwesome5 name="calendar-alt" size={24} color={oppColor} />
              <ListItem.Content>
                <ListItem.Title>Due date</ListItem.Title>
                <ListItem.Subtitle
                  style={{ color: dueDatePast ? "red" : oppColor }}
                >
                  {dueDateStr}
                </ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          )}

          {attachmentsCount > 0 && (
            <Pressable
              onPress={() => {
                // Scroll to attachments
                if (typeof attachmentsYpos === "number") {
                  scrollRef.current?.scrollTo({
                    y: attachmentsYpos,
                  });
                }
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <ListItem>
                <MaterialCommunityIcons
                  name="attachment"
                  size={24}
                  color={oppColor}
                />
                <ListItem.Content>
                  <ListItem.Title>
                    {attachmentsCount} attachments
                  </ListItem.Title>
                  <ListItem.Subtitle>Tap to view</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            </Pressable>
          )}
        </Card>

        {homework?.text && (
          <Card>
            <Card.Title>Homework Description</Card.Title>
            <Hyperlink
              linkDefault
              linkStyle={{ color: "#2980b9", textDecorationLine: "underline" }}
            >
              <Text style={styles.text}>{homework?.text}</Text>
            </Hyperlink>
          </Card>
        )}

        {/* Existing files */}
        {homework?.Attachments && homework.Attachments.length > 0 && (
          <View
            style={styles.attachments}
            onLayout={(e) => setAttachmentsYpos(e.nativeEvent.layout.y)}
          >
            <List
              estimatedItemSize={200}
              data={homework.Attachments}
              renderItem={({ item: attachment, index }) => {
                return (
                  <FilePreview
                    fileIdOrObject={attachment.File}
                    index={index}
                    style={{
                      marginBottom: 8,
                    }}
                    onPress={handleFilePress}
                  />
                );
              }}
            />
          </View>
        )}

        <View style={styles.gap} />
      </ScrollView>

      <SpeedDial
        isOpen={isActionOpen}
        icon={{ name: "menu", color: "white" }}
        openIcon={{ name: "close", color: "white" }}
        onOpen={() => setActionOpen(true)}
        onClose={() => setActionOpen(false)}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
      >
        {[
          isEditable ? (
            <SpeedDial.Action
              icon={{ name: "edit", color: "white" }}
              title="Edit"
              onPress={() =>
                navigation.navigate("UpdateHomeworkScreen", { homeworkId })
              }
              buttonStyle={{ backgroundColor: "#4E48B2" }}
            />
          ) : (
            <></>
          ),

          isEditable ? (
            <SpeedDial.Action
              icon={{ name: "delete", color: "white" }}
              title="Delete"
              onPress={() => {
                Alert.alert("Delete", "Do you want to delete this homework?", [
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress(value) {
                      deleteMutation.mutate({ homework_id: homeworkId });
                    },
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                    onPress(value) {
                      setActionOpen(false);
                    },
                  },
                ]);
              }}
              buttonStyle={{ backgroundColor: "#4E48B2" }}
            />
          ) : (
            <></>
          ),
        ]}
      </SpeedDial>

      <FullScreenFilePreview
        files={homework?.Attachments?.map((att) => att.File) ?? []}
        visible={!!pressedFileId}
        initialFileId={pressedFileId}
        onClose={() => setPressedFileId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  text: {},
  gap: {
    height: 100,
  },
  attachments: {
    padding: 16,
    minHeight: 200,
  },
});
