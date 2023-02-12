import { ScrollView } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { Text, View } from "../../../components/Themed";
import { RootStackScreenProps } from "../../../types";
import { trpc } from "../../../utils/trpc";

const ExamDetailsStudentScreen: React.FC<
  RootStackScreenProps<"ExamDetailsStudent">
> = ({
  route: {
    params: { testId },
  },
}) => {
  const testQuery = trpc.school.exam.getTestInfo.useQuery({ testId });

  if (testQuery.isLoading) return <Spinner visible />;

  return (
    <ScrollView>
      <Text>{JSON.stringify(testQuery.data, null, 2)}</Text>
    </ScrollView>
  );
};

export default ExamDetailsStudentScreen;
