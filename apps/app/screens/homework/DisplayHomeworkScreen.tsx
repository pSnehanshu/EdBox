import React from "react";
import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import HomeworkForm from "../../components/HomeworkForm";
import { Homework } from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import Spinner from "react-native-loading-spinner-overlay/lib";

export default function DisplayHomeworkScreen({
  route: { params: homeworkId },
}: NativeStackScreenProps<RootStackParamList, "DisplayHomeworkScreen">) {
  const navigation = useNavigation();
  // query
  const homeworkDetails = trpc.school.homework.fetchHomework.useQuery({
    homework_id: homeworkId.homeworkId,
  });
  return (
    <View>
      <Spinner visible={homeworkDetails.isLoading} />
      <Text>dispalay hw page</Text>
      <Pressable onPress={() => navigation.navigate("UpdateHomeworkScreen")}>
        <Text>Edit</Text>
      </Pressable>
      <Text>{homeworkDetails.data?.text}</Text>
      <Text>{homeworkDetails.data?.Subject?.name}</Text>
    </View>
  );
}
