import { Button } from "@rneui/themed";
import { Text, View } from "./Themed";
import { useConfig } from "../config";

interface SchoolSelectorProps {
  onSelect?: (schoolId: string) => void;
}
export default function SchoolSelector({ onSelect }: SchoolSelectorProps) {
  const [, setConfig] = useConfig();

  return (
    <View>
      <Text>School selector</Text>
      <Button
        onPress={async () => {
          const schoolId = "clcpuzcxf00001yvt5ppcenso";
          await setConfig({
            schoolId: "clcpuzcxf00001yvt5ppcenso",
          });

          onSelect?.(schoolId);
        }}
      >
        Set school
      </Button>
    </View>
  );
}
