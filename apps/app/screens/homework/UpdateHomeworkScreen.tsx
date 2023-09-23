import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Spinner from "react-native-loading-spinner-overlay/lib";
import { trpc } from "../../utils/trpc";
import { View } from "../../components/Themed";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";

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
    onSuccess() {
      navigation.replace("DisplayHomeworkScreen", {
        homeworkId,
      });
    },
    onError(error) {
      alert(error.message);
    },
  });

  return (
    <View style={{ height: "100%" }}>
      <Spinner visible={homeworkQuery.isLoading} textContent="Fetching..." />

      {homeworkQuery.data && (
        <HomeworkForm
          homework={homeworkQuery.data}
          onSubmit={(hw) => {
            homeworkQuery.remove();
            updateHomework.mutate({
              ...hw,
              homework_id: homeworkId,
              due_date: hw.due_date,
            });
          }}
          isSubmitting={updateHomework.isLoading}
        />
      )}
    </View>
  );
}
