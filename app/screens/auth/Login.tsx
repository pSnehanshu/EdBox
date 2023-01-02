import { View, Text } from "../../components/Themed";
import { useSchool } from "../../hooks/useSchool";
import { RootStackScreenProps } from "../../types";

export default function LoginScreen({}: RootStackScreenProps<"Login">) {
  const school = useSchool();

  return (
    <View>
      <Text>Login to {school.name}</Text>
    </View>
  );
}
