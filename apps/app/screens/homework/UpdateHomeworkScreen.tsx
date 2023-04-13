import React from "react";
import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";

export default function UpdateHomeworkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "UpdateHomeworkScreen"
>) {
  return (
    <View>
      <Text>yupdate hw page</Text>
    </View>
  );
}
