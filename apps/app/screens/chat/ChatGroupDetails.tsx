import { Text, View } from "../../components/Themed";
import type { RootStackScreenProps } from "../../utils/types/common";

export default function ChatGroupDetails({
  navigation,
  route: {
    params: { params },
  },
}: RootStackScreenProps<"ChatGroupDetails">) {
  return (
    <View>
      <Text>{params.name}</Text>
    </View>
  );
}
