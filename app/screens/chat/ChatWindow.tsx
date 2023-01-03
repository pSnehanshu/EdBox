import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text, View } from "../../components/Themed";
import { ChatsTabParamList } from "../../types";

export default function ChatWindowScreen({
  route: { params: groupInfo },
}: NativeStackScreenProps<ChatsTabParamList, "ChatWindow">) {
  return (
    <View>
      <Text>{JSON.stringify(groupInfo, null, 2)}</Text>
      <List
        data={["Chat1", "Chat2"]}
        renderItem={({ item: chat }) => {
          return <Text>{chat}</Text>;
        }}
      />
    </View>
  );
}
