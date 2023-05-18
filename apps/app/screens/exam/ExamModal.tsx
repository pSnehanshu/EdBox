import { useEffect, useMemo, useState } from "react";
import { Dialog, FAB, ListItem } from "@rneui/themed";
import React from "react";
import { List, Text, View } from "../../components/Themed";
import useColorScheme from "../../utils/useColorScheme";
import {
  ClassWithSections,
  ExamTest,
  Section,
  Subject,
} from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import { Switch } from "@rneui/themed";
import { CustomSelect } from "../../components/CustomSelect";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet } from "react-native";
import { useConfig } from "../../utils/config";
import DatePicker from "react-native-date-picker";
import { format, parseISO } from "date-fns";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { CustomSlider } from "../../components/CustomSlider";
import { ModalTextInput } from "../../components/ModalTextInput";
import TestModal from "./TestModal";
import type { ExamItem } from "schooltalk-shared/types";

interface ExamModalProps {
  displayAddButton: boolean;
  onSubmit: (name: string, tests: ExamTestSchema[]) => void;
  examData?: Extract<ExamItem, { type: "exam" }>["item"];
}

export default function ExamModal({
  displayAddButton,
  onSubmit,
  examData,
}: ExamModalProps) {
  const navigation = useNavigation();
  const config = useConfig();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [examName, setExamName] = useState(examData?.name ?? "");
  const [isTestCreateModal, setIsTestCreateModal] = useState(false);
  const [selectedTests, setTest] = useState<ExamTestSchema[]>([]);

  return (
    <View style={{ height: "100%" }}>
      <ModalTextInput
        isVisible={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onChange={setExamName}
        defaultValue={examName}
        title="Exam Name"
      />
      <Pressable
        onPress={() => setIsTextModalOpen(true)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.2 : 1,
        })}
      >
        <ListItem>
          <ListItem.Content>
            <ListItem.Subtitle>Exam Name</ListItem.Subtitle>
            <ListItem.Title>{examName || "Empty"}</ListItem.Title>
          </ListItem.Content>
          <MaterialCommunityIcons
            name="chevron-right"
            color={iconColor}
            size={16}
          />
        </ListItem>
      </Pressable>

      {displayAddButton && (
        <View>
          <View style={{ alignItems: "flex-end", margin: 5 }}>
            <Pressable
              style={({ pressed }) => [
                styles.add_button,
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
              onPress={() => {
                setIsTestCreateModal(true);
              }}
            >
              <Text
                style={{
                  color: "white",
                }}
              >
                Add Test
              </Text>
            </Pressable>
          </View>

          <View>
            <Text style={styles.text}>Test List</Text>
            <View style={{ borderTopWidth: 1 }}></View>
            <List
              data={selectedTests}
              renderItem={({ item }) => <TestItem test={item} />}
              estimatedItemSize={200}
            />
            <View style={{ width: "100%" }}>
              <Dialog
                isVisible={isTestCreateModal}
                onBackdropPress={() => setIsTestCreateModal(false)}
                animationType="fade"
                overlayStyle={{ width: "95%" }}
              >
                <Dialog.Title title={"Create Test"} />
                <View style={{ borderBottomWidth: 2 }}></View>
                <TestModal
                  isTestCreateModal={isTestCreateModal}
                  onClose={() => setIsTestCreateModal(false)}
                  onSubmit={(test) => {
                    setTest((tests) => tests.concat(test));
                  }}
                />
              </Dialog>
            </View>
          </View>
        </View>
      )}
      <FAB
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        onPress={() => {
          if (examName && selectedTests) {
            onSubmit(examName, selectedTests);
          } else {
            Toast.show({
              type: "error",
              text1: "Please provide a name",
            });
          }
        }}
        icon={
          <MaterialIcons
            name={examName ? "check" : "block"}
            size={24}
            color={"white"}
          />
        }
        placement="right"
      />
    </View>
  );
}
interface TestItemInterface {
  test: ExamTestSchema;
}
function TestItem({ test }: TestItemInterface) {
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});
  const selectedSubjects = subjectsQuery.data
    ?.filter((obj) => test.subjectIds.includes(obj.id))
    .map((obj) => obj.name);

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        width: "100%",
        borderBottomWidth: 1,
      })}
    >
      <View style={styles.testContainer}>
        <View style={styles.testContainerMain}>
          <Text style={styles.testName}>
            {selectedSubjects?.at(0)}
            {selectedSubjects && selectedSubjects?.length > 1
              ? ` & ${selectedSubjects?.length - 1} more`
              : ""}
          </Text>
          <Text>{format(new Date(test.date), "MMM dd, yyyy hh:mm aaa")}</Text>
        </View>
        <View style={styles.testContainerRight}>
          <Text>{test.duration_minutes} minutes</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {},
  homework: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    height: 80,
    overflow: "hidden",
  },
  homework_middle: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingLeft: 16,
    maxWidth: "80%",
  },
  homework_name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  homework_right: {
    backgroundColor: undefined,
    paddingRight: 8,
    marginLeft: "auto",
  },
  homework_description: {
    fontSize: 12,
    color: "gray",
  },
  empty: {
    height: "100%",
    justifyContent: "center",
  },
  add_button: {
    marginHorizontal: 18,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#4E48B2",
  },
  testContainer: {
    padding: 16,
    flexDirection: "row",
    flex: 1,
  },
  testContainerMain: {
    flexGrow: 1,
  },
  testContainerRight: {},
  testName: {
    fontWeight: "bold",
  },
  text: {
    marginHorizontal: 18,
    paddingBottom: 6,
    fontWeight: "500",
    fontSize: 16,
  },
});
