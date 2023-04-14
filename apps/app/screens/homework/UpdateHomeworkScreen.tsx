import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";
import { trpc } from "../../utils/trpc";

export default function UpdateHomeworkScreen({
  route: {
    params: { homeworkDetails },
  },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "UpdateHomeworkScreen">) {
  const updateHomework = trpc.school.homework.update.useMutation({
    onSuccess(data) {
      navigation.navigate("DisplayHomeworkScreen", {
        homeworkId: homeworkDetails.id,
      });
    },
    onError(error, variables, context) {
      alert(error.message);
    },
  });

  return (
    <View>
      <Text>Update Homework</Text>
      <HomeworkForm
        homework={homeworkDetails}
        onSubmit={(hw) =>
          updateHomework.mutate({
            ...hw,
            homework_id: homeworkDetails.id,
            due_date: hw.due_date?.toISOString(),
          })
        }
      />
    </View>
  );
}
