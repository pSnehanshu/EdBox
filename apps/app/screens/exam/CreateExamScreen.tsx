import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";
import { FAB, ListItem } from "@rneui/themed";
import { Pressable, StyleProp, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import { ModalTextInput } from "../../components/ModalTextInput";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import TestModal from "./TestModal";

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
      {/* new test modal */}
      <View style={{ width: "10%" }}>
        <TestModal
          isTestCreateModal={isTestCreateModal}
          onClose={() => setIsTestCreateModal(false)}
        />
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
