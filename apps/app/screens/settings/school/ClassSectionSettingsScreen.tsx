import { ScrollView } from "react-native";
import { Text } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";

export default function ClassSectionSettingsScreen() {
  const classesQuery = trpc.school.class.fetchClassesAndSections.useQuery();

  return (
    <ScrollView>
      <Text>{JSON.stringify(classesQuery.data, null, 2)}</Text>
    </ScrollView>
  );
}
