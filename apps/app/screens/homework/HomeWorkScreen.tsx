import { Pressable, StyleSheet, SafeAreaView } from "react-native";
import { RootStackParamList } from "../../utils/types/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text, View } from "../../components/Themed";
import { FAB } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";
import { Homework } from "schooltalk-shared/types";
import { format, parseISO } from "date-fns";

export default function HomeWorkScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HomeWorkScreen">) {
  const homeworkQuery = trpc.school.homework.fetchForTeacher.useQuery({
    limit: 10,
  });

  const color = useColorScheme();

  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      <FAB
        icon={
          <Ionicons
            name="add"
            size={24}
            color={color === "dark" ? "black" : "white"}
          />
        }
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 100,
          elevation: 1,
          flex: 1,
        }}
        color={color === "dark" ? "white" : "black"}
        onPress={() => navigation.navigate("CreateHomeworkScreen")}
      />
      <SafeAreaView style={{ height: "100%", width: "100%" }}>
        <List
          data={homeworkQuery?.data?.data}
          keyExtractor={(g) => g.id}
          estimatedItemSize={200}
          renderItem={({ item }) => (
            <SingleHomework
              homework={item}
              onClick={() =>
                navigation.navigate("DisplayHomeworkScreen", {
                  homeworkId: item.id,
                })
              }
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

interface HomeworkProps {
  homework: Homework | any;
  onClick: () => void;
}
function SingleHomework({ homework, onClick }: HomeworkProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chatGroup,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onClick}
    >
      <View style={styles.chatGroupMiddle}>
        <Text style={styles.chatGroupName}>{homework.Subject.name}</Text>
        <Text style={styles.chatGroupLastMessage}>
          {homework.text ? homework.text : ""}
        </Text>
      </View>
      <View style={styles.chatGroupRight}>
        <Text style={styles.chatGroupLastMessage}>
          Due-
          {homework.due_date
            ? format(parseISO(homework.due_date), "dd-MM-yyyy")
            : "NA"}
        </Text>
      </View>
      <View>
        {/* <Pressable
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 15,
            paddingLeft: 20,
            paddingRight: 20,
          }}
          onPress={() => {
            openModal();
            // setHomeworkFormData(homework);
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "black" }}>
            View
          </Text>
        </Pressable> */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // test
    backgroundColor: "#4E48B2",
    // flex: 1,
    margin: 10,
    borderRadius: 15,
    paddingVertical: 8,
    paddingLeft: 16,
    shadowColor: "gray",
    shadowRadius: 8,
    shadowOffset: {
      height: 8,
      width: 8,
    },
  },
  centeredView: {
    position: "relative",
    flex: 1,
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "transparent",
  },
  modalView: {
    margin: 20,
    borderRadius: 15,
    padding: 35,
    // alignItems: "center",
    width: "90%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: "#4E48B2",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  mainText: {
    textAlign: "left",
    fontSize: 24,
    marginBottom: 12,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
  },
  inputText: {
    height: 100,
    marginBottom: 5,
    borderWidth: 1,
    borderRadius: 15,
    textAlignVertical: "top",
    paddingTop: 12,
    padding: 20,
    color: "#2A2A2A",
  },
  text_class: {
    paddingTop: 6,
    paddingBottom: 8,
    fontSize: 18,
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
  },
  dropdown1BtnTxtStyle: {
    color: "#000",
    textAlign: "left",
    fontSize: 14,
  },
  dropdown1DropdownStyle: {
    backgroundColor: "#EFEFEF",
    marginTop: 0,
    borderRadius: 15,
  },
  dropdown1RowStyle: {
    backgroundColor: "white",
    borderBottomColor: "#C5C5C5",
    height: 40,
  },
  dropdown1RowTxtStyle: {
    color: "#2A2A2A",
    textAlign: "center",
  },
  round_icon: {
    backgroundColor: "#4E48B2",
    padding: 15,
    alignItems: "center",
    height: 60,
    width: 60,
    borderRadius: 999,
    textAlign: "center",
    justifyContent: "center",
  },
  chatGroup: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    height: 80,
    overflow: "hidden",
  },
  chatGroupMiddle: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingLeft: 16,
    maxWidth: "80%",
  },
  chatGroupName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chatGroupRight: {
    backgroundColor: undefined,
    paddingRight: 8,
    marginLeft: "auto",
  },
  chatGroupLastMessage: {
    fontSize: 12,
    color: "gray",
  },
});
