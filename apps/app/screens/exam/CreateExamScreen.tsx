import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import ExamModal from "./ExamModal";

export default function CreateExamScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateExamScreen">) {
  const createExam = trpc.school.exam.createExam.useMutation({
    onSuccess(data) {
      navigation.replace("ExamDetails", { examId: data.id });
    },
    onError(error, variables, context) {
      console.log(error, variables, context);
    },
  });

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
