import { format } from "date-fns";
import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import { Dialog, FAB, ListItem } from "@rneui/themed";
import { Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { ModalTextInput } from "../../components/ModalTextInput";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import TestModal from "./TestModal";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import ExamModal from "./ExamModal";

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
      <ExamModal
        displayAddButton={true}
        onSubmit={(examName, tests) => {
          createExam.mutate({
            name: examName,
            tests: tests,
          });
        }}
      />
    </View>
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
    borderBottomWidth: 1,
  },
});
