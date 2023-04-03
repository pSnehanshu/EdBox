import React from "react";
import { ScrollView } from "react-native";
import { RootStackParamList } from "../utils/types/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "../components/Themed";

type Props = {};

export default function HomeWorkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "HomeWorkScreen"
>) {
  return (
    <ScrollView>
      <Text>test</Text>
    </ScrollView>
  );
}
