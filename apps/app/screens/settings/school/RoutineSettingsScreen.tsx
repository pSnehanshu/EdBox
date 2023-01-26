import { ScrollView } from "react-native";
import { Text } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";

export function RoutineSettingsScreen() {
  const routineQuery = trpc.school.routine.fetchForSchool.useQuery();

  return (
    <ScrollView>
      <Text>{JSON.stringify(routineQuery.data, null, 2)}</Text>
    </ScrollView>
  );
}
