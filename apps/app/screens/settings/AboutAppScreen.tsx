import { Button, ScrollView } from "react-native";
// import * as Updates from "expo-updates";
// import { Text } from "../../components/Themed";

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
    <ScrollView>
      {/* <Button title="Fetch update" onPress={onFetchUpdateAsync} />
      <Text>
        isEmbeddedLaunch: {Updates.isEmbeddedLaunch ? "true" : "false"}
      </Text>
      <Text>isEmbeddedLaunch: {JSON.stringify(Updates.manifest, null, 2)}</Text> */}
    </ScrollView>
  );
}
