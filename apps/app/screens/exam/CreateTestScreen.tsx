import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import { RootStackParamList } from "../../utils/types/common";
import { StyleSheet } from "react-native";
import useColorScheme from "../../utils/useColorScheme";
import TestModal from "./TestModal";

export default function CreateTestScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "CreateTestScreen">) {
  const scheme = useColorScheme();

  const createTest = trpc.school.exam.createTest.useMutation({
    onSuccess(data) {
      navigation.replace("ExamsScreen");
    },
    onError(error, variables, context) {
      console.log(error, variables, context);
    },
  });

  const [isTestCreateModal, setIsTestCreateModal] = useState(false);

  return (
    <View style={{ height: "100%" }}>
      <View style={{ width: "100%" }}>
        <TestModal
          isTestCreateModal={isTestCreateModal}
          onClose={() => setIsTestCreateModal(false)}
          onSubmit={(test) => {
            createTest.mutate(test);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homework: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    height: 80,
    overflow: "hidden",
  },
  homework_middle: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingLeft: 16,
    maxWidth: "80%",
  },
  homework_name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  homework_right: {
    backgroundColor: undefined,
    paddingRight: 8,
    marginLeft: "auto",
  },
  homework_description: {
    fontSize: 12,
    color: "gray",
  },
  empty: {
    height: "100%",
    justifyContent: "center",
  },
  add_button: { borderWidth: 1, padding: 10, borderRadius: 5 },
});
