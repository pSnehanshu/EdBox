import { List, Text, View } from "../../components/Themed";
import { RootStackScreenProps } from "../../types";

export default function AttendanceTakerScreen({
  route: {
    params: { periodId },
  },
}: RootStackScreenProps<"AttendanceTaker">) {
  return (
    <View>
      <Text>Period Id: {periodId}</Text>
    </View>
  );
}
