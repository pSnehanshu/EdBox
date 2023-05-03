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

export default function CreateTestScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateTestScreen">) {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const createTest = trpc.school.exam.createTest.useMutation({
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
      <View style={{ width: "100%" }}>
        <TestModal
          isTestCreateModal={isTestCreateModal}
          onClose={() => setIsTestCreateModal(false)}
          onSubmit={(test) => {
            // createTest.mutate(test);
            // todo date type
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  add_button: { borderWidth: 1, padding: 10, borderRadius: 5 },
});
