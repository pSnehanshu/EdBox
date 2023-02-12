// This screen shows a time line with the exams and class tests

import { Button } from "@rneui/base";
import React from "react";
import { ScrollView } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { Text } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";

const ExamListScreen: React.FC = () => {
  const query = trpc.school.exam.fetchExamsAndTestsForStudent.useQuery({});

  if (query.isLoading) return <Spinner visible />;

  return (
    <ScrollView>
      <Button onPress={() => query.refetch()}>Refresh</Button>
      <Text>{JSON.stringify(query.data, null, 2)}</Text>
    </ScrollView>
  );
};

export default ExamListScreen;
