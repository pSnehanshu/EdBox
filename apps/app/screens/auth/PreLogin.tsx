import { Button, Image, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { View } from "../../components/Themed";
import { useSchool } from "../../utils/useSchool";
import * as WebBrowser from "expo-web-browser";
import { RootStackScreenProps } from "../../utils/types/common";

export default function PreLoginScreen({
  navigation,
}: RootStackScreenProps<"PreLogin">) {
  const school = useSchool();

  if (!school) return null;

  return (
    <>
      <View style={styles.container}>
        <Image
          style={{
            height: 200,
            aspectRatio: 0.74, // TODO: Dynamic aspect ratio
            backgroundColor: "white",
            alignSelf: "center",
          }}
          source={{
            uri:
              school.logo ||
              "http://www.indorhino.com/wp-content/uploads/2022/11/indorhino-low-resolution-logo-color-on-transparent-background.png",
          }}
        />

        <Button
          title={`Login to your ${school.name} account`}
          onPress={() => navigation.navigate("Login")}
        />
      </View>

      {school.website && (
        <WebView
          style={styles.web}
          source={{
            uri: school.website,
          }}
          startInLoadingState={true}
          onNavigationStateChange={(navState) => {
            if (navState.canGoBack) {
              WebBrowser.openBrowserAsync(navState.url);
            }
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  web: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "white",
  },
});
