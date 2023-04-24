import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "../../components/Themed";
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
import { Subject } from "schooltalk-shared/types";
import { AnyKindOfDictionary } from "lodash";
import type { ExamTestSchema } from "schooltalk-shared/misc";

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
  const [test, setTest] = useState<ExamTestSchema>();
  console.log(JSON.stringify(test, null, 2));
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

      <View style={{ width: "10%" }}>
        {/* new test modal */}
        <Dialog
          isVisible={isTestCreateModal}
          onBackdropPress={() => setIsTestCreateModal(false)}
          animationType="fade"
          style={{ width: "100%" }}
        >
          <Dialog.Title title={"Create Test"} />
          <TestModal
            isTestCreateModal={isTestCreateModal}
            onClose={() => setIsTestCreateModal(false)}
            onSubmit={(test) => {
              // TODO: Push `test` to an array
              setTest(test);
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
          if (examName) {
            createExam.mutate({
              name: examName,
              tests: [],
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
