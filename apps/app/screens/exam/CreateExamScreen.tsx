import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { List, Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";
import { Dialog, FAB, ListItem } from "@rneui/themed";
import { Pressable, StyleProp, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { ModalTextInput } from "../../components/ModalTextInput";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import TestModal from "./TestModal";
import { ArrayElement, Subject } from "schooltalk-shared/types";
import { AnyKindOfDictionary } from "lodash";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import { ListRenderItem } from "@shopify/flash-list";

export default function CreateExamScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateExamScreen">) {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const createExam = trpc.school.exam.createExam.useMutation({
    onSuccess(data) {
      navigation.replace("ExamsScreen");
    },
    onError(error, variables, context) {
      console.log(error, variables, context);
    },
  });
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [examName, setExamName] = useState("");
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
          borderBottomWidth: 1,
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

      {/* tests */}
      <View style={{ alignItems: "flex-end", margin: 5 }}>
        <Pressable
          style={{ borderWidth: 1, padding: 10 }}
          onPress={() => {
            setIsTestCreateModal(true);
          }}
        >
          <Text>Add Test</Text>
        </Pressable>
      </View>

      {/* test list */}
      <List
        data={selectedTests}
        renderItem={({ item }) => <TestItem test={item} />}
        estimatedItemSize={200}
      />
      <View style={{ width: "10%" }}>
        {/* new test modal */}
        <Dialog
          isVisible={isTestCreateModal}
          onBackdropPress={() => setIsTestCreateModal(false)}
          animationType="fade"
          style={{ width: "100%" }}
        >
          <Dialog.Title title={"Create Test"} />
          <View style={{ borderBottomWidth: 2 }}></View>
          <TestModal
            isTestCreateModal={isTestCreateModal}
            onClose={() => setIsTestCreateModal(false)}
            onSubmit={(test) => {
              // TODO: Push `test` to an array
              setTest((tests) => tests.concat(test));
            }}
          />
          {/* <Dialog.Actions>
            <Dialog.Button title="Done" onPress={() => {}} type="solid" />
          </Dialog.Actions> */}
        </Dialog>
      </View>

      <FAB
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        onPress={() => {
          if (examName && selectedTests) {
            createExam.mutate({
              name: examName,
              tests: [],
              // type error
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Please provide a name",
            });
          }
        }}
        icon={<MaterialCommunityIcons name="check" size={24} color={"white"} />}
        placement="right"
      />
    </View>
  );
}
interface TestItemInterface {
  test: ExamTestSchema;
  // onRemove?:()=>void;
}
function TestItem({ test }: TestItemInterface) {
  return (
    <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
      <Text>{test.name}</Text>
    </Pressable>
  );
}
