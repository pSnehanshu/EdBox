import React from "react";
import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";

export default function UpdateHomeworkScreen({
  route: { params: homeworkDetails },
}: NativeStackScreenProps<RootStackParamList, "UpdateHomeworkScreen">) {
  return (
    <View>
      <Text>Update Homework</Text>
      <HomeworkForm homework={homeworkDetails.homeworkDetails} />
    </View>
  );
}
