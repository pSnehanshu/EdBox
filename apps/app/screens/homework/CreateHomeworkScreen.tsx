import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { useConfig } from "../../utils/config";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";

export default function CreateHomeworkScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateHomeworkScreen">) {
  const config = useConfig();
  // mutation
  const createHomework = trpc.school.homework.create.useMutation({
    onSuccess(data) {
      navigation.navigate("DisplayHomeworkScreen", { homeworkId: data.id });
    },
    onError(error, variables, context) {
      alert(error);
    },
  });

  return (
    <View>
      <Text>Create Homework</Text>
      <HomeworkForm
        onSubmit={(hw) =>
          createHomework.mutate({
            ...hw,
            due_date: hw.due_date?.toISOString(),
            file_permissions: hw.new_file_permissions,
          })
        }
      />
    </View>
  );
}
