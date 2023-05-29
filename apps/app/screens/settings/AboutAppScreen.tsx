import { ScrollView } from "react-native";
import { Text } from "../../components/Themed";
// import * as Updates from "expo-updates";
// import { Text } from "../../components/Themed";

// @ts-expect-error Due to my laziness, I haven't declared `HermesInternal`, but I know it exists
const isHermes = () => !!global.HermesInternal;

export default function AboutAppScreen() {
  // async function onFetchUpdateAsync() {
  //   try {
  //     const update = await Updates.checkForUpdateAsync();

  //     if (update.isAvailable) {
  //       await Updates.fetchUpdateAsync();
  //       await Updates.reloadAsync();
  //     }
  //   } catch (error) {
  //     alert(`Error fetching latest Expo update: ${error}`);
  //   }
  // }

  return (
    <ScrollView style={{ padding: 8 }}>
      <Text>Is running on Hermes? {isHermes() ? "Yes" : "No"}</Text>
      {/* <Button title="Fetch update" onPress={onFetchUpdateAsync} />
      <Text>
        isEmbeddedLaunch: {Updates.isEmbeddedLaunch ? "true" : "false"}
      </Text>
      <Text>isEmbeddedLaunch: {JSON.stringify(Updates.manifest, null, 2)}</Text> */}
    </ScrollView>
  );
}
