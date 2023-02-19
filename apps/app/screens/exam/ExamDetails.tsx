import { Card, Text } from "@rneui/themed";
import { differenceInDays, parseISO } from "date-fns";
import { useMemo } from "react";
import { useEffect } from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { TestComp } from "../../components/TestComp";
import { List } from "../../components/Themed";
import { RootStackScreenProps } from "../../utils/types/common";
import { trpc } from "../../utils/trpc";

const ExamDetailsStudentScreen: React.FC<
  RootStackScreenProps<"ExamDetails">
> = ({
  route: {
    params: { examId },
  },
  navigation,
}) => {
  const examQuery = trpc.school.exam.getExamInfo.useQuery({ examId });

  useEffect(() => {
    if (examQuery.isFetched) {
      navigation.setOptions({
        title: `Exam: ${examQuery.data?.name}`,
      });
    }
  }, [examQuery.isFetching]);

  const examDuration = useMemo(() => {
    if (examQuery.data) {
      const firstTestDate = examQuery.data.Tests.at(0)?.date_of_exam;
      const lastTestDate = examQuery.data.Tests.at(-1)?.date_of_exam;

      if (!firstTestDate || !lastTestDate) return "N/A";

      const days =
        differenceInDays(parseISO(lastTestDate), parseISO(firstTestDate)) + 1;

      return `${days} days`;
    }
  }, [examQuery.data?.Tests]);

  if (examQuery.isLoading || !examQuery.data) return <Spinner visible />;
  const { data: exam } = examQuery;

  return (
    <List
      keyExtractor={(t) => t.id}
      data={exam.Tests}
      renderItem={({ item }) => <TestComp test={{ ...item, Exam: null }} />}
      ListHeaderComponent={
        <Card>
          <Card.Title>Details</Card.Title>
          <Card.Divider />
          <Text>Name: {exam.name}</Text>
          <Text>Number of tests: {exam.Tests.length}</Text>
          <Text>Duration: {examDuration}</Text>
        </Card>
      }
    />
  );
};

export default ExamDetailsStudentScreen;
