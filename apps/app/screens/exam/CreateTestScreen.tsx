import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import TestModal from "./TestModal";
import Spinner from "react-native-loading-spinner-overlay";

export default function CreateTestScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateTestScreen">) {
  const createTest = trpc.school.exam.createTest.useMutation({
    onSuccess(data) {
      navigation.replace("TestDetails", { testId: data.id });
    },
    onError(error, variables, context) {
      console.log(error, variables, context);
    },
  });

  return (
    <View style={{ height: "100%", width: "100%" }}>
      <Spinner visible={createTest.isLoading} />
      <TestModal onSubmit={createTest.mutate} />
    </View>
  );
}
