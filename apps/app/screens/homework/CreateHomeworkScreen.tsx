import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";

export default function CreateHomeworkScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateHomeworkScreen">) {
  // mutation
  const createHomework = trpc.school.homework.create.useMutation({
    onSuccess(data) {
      navigation.replace("DisplayHomeworkScreen", { homeworkId: data.id });
    },
    onError(error) {
      alert(error);
    },
  });

  return (
    <View style={{ height: "100%" }}>
      <HomeworkForm
        onSubmit={(hw) =>
          createHomework.mutate({
            ...hw,
            due_date: hw.due_date,
            file_permissions: hw.new_file_permissions,
          })
        }
        isSubmitting={createHomework.isLoading}
      />
    </View>
  );
}
