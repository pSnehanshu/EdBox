import Spinner from "react-native-loading-spinner-overlay/lib";
import { ScrollView } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";
import { trpc } from "../../utils/trpc";

export default function UpdateHomeworkScreen({
  route: {
    params: { homeworkId },
  },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "UpdateHomeworkScreen">) {
  const homeworkQuery = trpc.school.homework.fetchHomework.useQuery({
    homework_id: homeworkId,
  });

  const updateHomework = trpc.school.homework.update.useMutation({
    onSuccess(data) {
      navigation.navigate("DisplayHomeworkScreen", {
        homeworkId,
      });
    },
    onError(error, variables, context) {
      alert(error.message);
    },
  });

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <Spinner visible={homeworkQuery.isLoading} textContent="Fetching..." />

      {homeworkQuery.data && (
        <HomeworkForm
          homework={homeworkQuery.data}
          onSubmit={(hw) => {
            homeworkQuery.remove();
            updateHomework.mutate({
              ...hw,
              homework_id: homeworkId,
              due_date: hw.due_date?.toISOString(),
            });
          }}
        />
      )}
    </ScrollView>
  );
}
