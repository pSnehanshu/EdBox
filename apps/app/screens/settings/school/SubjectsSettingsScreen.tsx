import { ScrollView } from "react-native";
import { Text } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";

export default function SubjectsSettingsScreen() {
  const subjectQuery = trpc.school.subject.fetchSubjects.useQuery({});

  return (
    <ScrollView>
      <Text>{JSON.stringify(subjectQuery.data, null, 2)}</Text>
    </ScrollView>
  );
}
