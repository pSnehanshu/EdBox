import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import { Pressable } from "react-native";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay/lib";

export default function DisplayHomeworkScreen({
  route: {
    params: { homeworkId },
  },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "DisplayHomeworkScreen">) {
  // query
  const homeworkQuery = trpc.school.homework.fetchHomework.useQuery({
    homework_id: homeworkId,
  });

  return (
    <View>
      <Spinner visible={homeworkQuery.isLoading} />
      <Pressable
        style={{ padding: 10, backgroundColor: "red" }}
        onPress={() => {
          if (homeworkQuery.data)
            navigation.navigate("UpdateHomeworkScreen", {
              homeworkId,
            });
        }}
      >
        <Text>Edit</Text>
      </Pressable>
      <Text>{homeworkQuery.data?.text}</Text>
      <Text>{homeworkQuery.data?.Subject?.name}</Text>
    </View>
  );
}
