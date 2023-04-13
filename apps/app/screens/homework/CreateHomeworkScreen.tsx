import React from "react";
import { List, Text, TextInput, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { useConfig } from "../../utils/config";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import HomeworkForm from "../../components/HomeworkForm";

export default function CreateHomeworkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "CreateHomeworkScreen"
>) {
  const config = useConfig();
  // mutation
  const createHomework = trpc.school.homework.create.useMutation({
    onSuccess(data) {
      // alert(JSON.stringify(data, null, 2));
      // onClose();
    },
    onError(error, variables, context) {
      alert(error);
    },
  });

  return (
    <View>
      <Text>Create Homework</Text>
      <HomeworkForm />
    </View>
  );
}
