import { useState } from "react";
import { FAB, ListItem, Dialog, Button } from "@rneui/themed";
import React from "react";
import { List, Text, View } from "./Themed";
import useColorScheme from "../utils/useColorScheme";
import { trpc } from "../utils/trpc";
import { Pressable, StyleSheet } from "react-native";
import { format } from "date-fns";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { ModalTextInput } from "./ModalTextInput";
import TestModal from "../components/TestModal";
import type { ExamItem } from "schooltalk-shared/types";
import { LottieAnimation } from "./LottieAnimation";

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
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [examName, setExamName] = useState(examData?.name ?? "");
  const [isTestCreateModal, setIsTestCreateModal] = useState(false);
  const [selectedTests, setTest] = useState<ExamTestSchema[]>([]);
  const [currentTest, setCurrentTest] = useState<ExamTestSchema | null>(null);
  const [currentTestIndex, setCurrentTestIndex] = useState<number | null>(null);

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

      {displayAddButton &&
        (selectedTests.length > 0 ? (
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
            <View style={{ height: "100%" }}>
              <Text style={styles.text}>Test List</Text>
              <View style={{ borderTopWidth: 1, borderColor: "gray" }}></View>
              <List
                data={selectedTests}
                renderItem={({ item, index }) => (
                  <TestItem
                    test={item}
                    onDelete={() => {
                      setTest((tests) => tests.filter((e, i) => i !== index));
                    }}
                    onEdit={() => {
                      setIsTestCreateModal(true);
                      setCurrentTest(item);
                      setCurrentTestIndex(index);
                    }}
                  />
                )}
                estimatedItemSize={200}
              />
            </View>
          </View>
        ) : (
          <View>
            <LottieAnimation
              src={require("../assets/lotties/shake-a-empty-box.json")}
              caption="No Tests to show. It's quite empty!"
              style={styles.no_tests}
            />
            <View style={{ alignItems: "center", margin: 5 }}>
              <Pressable
                style={({ pressed }) => [
                  styles.add_button,
                  {
                    opacity: pressed ? 0.5 : 1,
                    width: "75%",
                  },
                ]}
                onPress={() => {
                  setIsTestCreateModal(true);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  Add Test
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

      <View style={{ width: "100%" }}>
        <Dialog
          isVisible={isTestCreateModal}
          onBackdropPress={() => setIsTestCreateModal(false)}
          animationType="fade"
          overlayStyle={{ width: "95%", height: "85%" }}
        >
          <Dialog.Title
            title={currentTest ? "Update Test" : "Create Test"}
            titleStyle={{ textAlign: "center" }}
          />
          <View style={{ marginTop: 4 }}></View>
          <TestModal
            onClose={() => setIsTestCreateModal(false)}
            onSubmit={(test) => {
              if (currentTest && typeof currentTestIndex === "number") {
                setTest((tests) => {
                  tests.splice(currentTestIndex, 1, test);
                  return tests;
                });
              } else {
                setTest((tests) => tests.concat(test));
              }

              setCurrentTest(null);
              setCurrentTestIndex(null);
            }}
            testData={currentTest}
          />
        </Dialog>
      </View>

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
  onDelete: () => void;
  onEdit: () => void;
}
function TestItem({ test, onDelete, onEdit }: TestItemInterface) {
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});
  const selectedSubjects = subjectsQuery.data
    ?.filter((obj) => test.subjectIds.includes(obj.id))
    .map((obj) => obj.name);

  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  return (
    <View
      style={{
        width: "100%",
        borderBottomWidth: 1,
        borderColor: "gray",
      }}
    >
      <View style={styles.testContainer}>
        <View style={styles.testContainerMain}>
          <Text style={styles.testName}>
            {selectedSubjects?.at(0)}
            {selectedSubjects && selectedSubjects?.length > 1
              ? ` & ${selectedSubjects?.length - 1} more`
              : ""}
          </Text>

          <Text>
            {format(new Date(test.date_of_exam), "MMM dd, yyyy hh:mm aaa")}
          </Text>
        </View>
        <View style={styles.testContainerRight}>
          <Text>{test.duration_minutes} minutes</Text>
          <Text>{test.total_marks} marks</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          marginBottom: 8,
        }}
      >
        <Button radius={"sm"} type="outline" onPress={onEdit}>
          <MaterialCommunityIcons
            name="lead-pencil"
            size={16}
            color={iconColor}
            style={{ marginRight: 8 }}
          />
          <Text>Edit</Text>
        </Button>
        <Button
          radius={"sm"}
          type="outline"
          buttonStyle={{
            borderColor: "red",
          }}
          onPress={onDelete}
        >
          <MaterialCommunityIcons
            name="delete"
            size={16}
            color="red"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: "red" }}>Delete</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  testContainerRight: {
    flexDirection: "column",
  },
  testName: {
    fontWeight: "bold",
  },
  text: {
    marginHorizontal: 18,
    paddingBottom: 6,
    fontWeight: "500",
    fontSize: 16,
  },
  no_tests: {
    marginTop: 24,
    marginBottom: 16,
  },
});
