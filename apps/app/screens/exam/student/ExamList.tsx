// This screen shows a time line with the exams and class tests

import React from "react";
import { ScrollView } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { Text } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";

const ExamListScreen: React.FC = () => {
  const testsQuery = trpc.school.exam.fetchTestsForStudent.useQuery({});
  const examsQuery = trpc.school.exam.fetchExamsForStudent.useQuery({});
  const isLoading = testsQuery.isLoading || examsQuery.isLoading;

  if (isLoading) return <Spinner visible />;

  return (
    <ScrollView>
      <Text>{JSON.stringify(testsQuery.data, null, 2)}</Text>
      <Text>{JSON.stringify(examsQuery.data, null, 2)}</Text>
    </ScrollView>
  );
};

export default ExamListScreen;
