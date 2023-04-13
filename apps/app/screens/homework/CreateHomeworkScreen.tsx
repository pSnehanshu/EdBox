import React from "react";
import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";

export default function CreateHomeworkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "CreateHomeworkScreen"
>) {
  return (
    <View>
      <Text>create hw page</Text>
    </View>
  );
}
