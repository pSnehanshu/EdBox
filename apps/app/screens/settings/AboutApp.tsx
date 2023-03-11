import { Button, Card } from "@rneui/themed";
import { ScrollView, StyleSheet } from "react-native";
import { Text, View } from "../../components/Themed";
import config from "../../config";
import { useUpdates } from "../../utils/updates";

const AboutAppScreen: React.FC = () => {
  const { isChecking, isUpdateAvailable, check, update, Updates } =
    useUpdates();

  return (
    <ScrollView>
      {isUpdateAvailable ? (
        <Card>
          <Card.Title>Update available!</Card.Title>
          <Card.Divider />
          <Button onPress={update}>Update now!</Button>
        </Card>
      ) : null}

      <Card>
        <Card.Title>App details</Card.Title>
        <Card.Divider />
        <Text>Runtime version: {Updates.runtimeVersion}</Text>
        <Text>Update ID: {Updates.updateId}</Text>
        <Text>
          Update created at:{" "}
          {Updates.createdAt ? Updates.createdAt.toISOString() : "N/A"}
        </Text>
        <Text>Release channel: {Updates.releaseChannel}</Text>

        <View style={style.actionBtns}>
          <Button onPress={() => alert(JSON.stringify(config, null, 2))}>
            View config
          </Button>

          <Button onPress={check} disabled={isChecking}>
            {isChecking ? "Checking for update..." : "Check for updates"}
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
};

export default AboutAppScreen;

const style = StyleSheet.create({
  actionBtns: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
