import React from "react";
import { View, Text } from "../../components/Themed";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../utils/types/common";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DisplayHomeworkScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "DisplayHomeworkScreen"
>) {
  const navigation = useNavigation();
  return (
    <View>
      <Text>
        dispalay hw page
        <Pressable onPress={() => navigation.navigate("UpdateHomeworkScreen")}>
          <Text>Edit</Text>
        </Pressable>
      </Text>
    </View>
  );
}
