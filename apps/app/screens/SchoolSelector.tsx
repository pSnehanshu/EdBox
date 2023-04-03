import { Button } from "@rneui/themed";
import { Text, View } from "../components/Themed";
import { useConfig } from "../config";

export default function SchoolSelectorScreen() {
  const [, setConfig] = useConfig();

  return (
    <View>
      <Text>School selector</Text>
      <Button
        onPress={() =>
          setConfig({
            schoolId: "clcpuzcxf00001yvt5ppcenso",
          })
        }
      >
        Set school
      </Button>
    </View>
  );
}
