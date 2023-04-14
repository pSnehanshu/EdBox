import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import { Pressable } from "react-native";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay/lib";

export default function DisplayHomeworkScreen({
  route: { params: homeworkId },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "DisplayHomeworkScreen">) {
  // query
  const homeworkDetails = trpc.school.homework.fetchHomework.useQuery({
    homework_id: homeworkId.homeworkId,
  });

  return (
    <View>
      <Spinner visible={homeworkDetails.isLoading} />
      <Pressable
        style={{ padding: 10, backgroundColor: "red" }}
        onPress={() => {
          if (homeworkDetails.data)
            navigation.navigate("UpdateHomeworkScreen", {
              homeworkDetails: homeworkDetails.data,
            });
        }}
      >
        <Text>Edit</Text>
      </Pressable>
      <Text>{homeworkDetails.data?.text}</Text>
      <Text>{homeworkDetails.data?.Subject?.name}</Text>
    </View>
  );
}
