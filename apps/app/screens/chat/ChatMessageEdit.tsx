import React, { useState } from "react";
import { Text, View } from "../../components/Themed";
import RBSheet from "react-native-raw-bottom-sheet";
import { StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Dialog } from "@rneui/themed";

interface ChatMessageEditProps {
  chatMessageId: any;
  refRBSheet: any;
}
export default function ChatMessageEdit({
  chatMessageId,
  refRBSheet,
}: ChatMessageEditProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [typeOfEdit, setTypeOfEdit] = useState<
    "edit" | "delete" | "report" | "info" | null
  >(null);
  const popupArray = [
    {
      title: "Edit",
      icon: <MaterialIcons name="edit" size={24} color="black" />,
      onPress: () => setTypeOfEdit("edit"),
      onDone: "",
    },
    {
      title: "Delete",
      icon: <MaterialIcons name="delete" size={24} color="black" />,
      onPress: () => setTypeOfEdit("delete"),
      onDone: "",
    },
    {
      title: "Report",
      icon: <MaterialIcons name="report" size={24} color="black" />,
      onPress: () => setTypeOfEdit("report"),
      onDone: "",
    },
    {
      title: "Info",
      icon: <MaterialIcons name="info" size={24} color="black" />,
      onPress: () => setTypeOfEdit("info"),
      onDone: "",
    },
  ];

  return (
    <View>
      <Dialog
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        animationType="fade"
      >
        <Text>{typeOfEdit}</Text>
        <Dialog.Actions>
          <Dialog.Button
            title="Done"
            onPress={() => {
              setIsVisible(false);
            }}
            type="solid"
          />
        </Dialog.Actions>
      </Dialog>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={260}
        customStyles={{
          container: styles.bottom_sheet_container,
          wrapper: styles.bottom_sheet_wrapper,
          draggableIcon: styles.bottom_sheet_draggable_icon,
        }}
        openDuration={200}
        closeDuration={200}
      >
        {popupArray.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => {
              setIsVisible(true);
              item.onPress();
              refRBSheet.current?.close();
            }}
            style={({ pressed }) => [
              styles.item,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            {item.icon}
            <View style={styles.titleArea}>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
          </Pressable>
        ))}
      </RBSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bottom_sheet_container: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  bottom_sheet_wrapper: {
    backgroundColor: "transparent",
  },
  bottom_sheet_draggable_icon: {
    backgroundColor: "#000",
  },
  item: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    paddingLeft: 8,
  },
  icon: {
    width: 48,
    marginVertical: 4,
  },
  titleArea: {
    backgroundColor: undefined,
    flexGrow: 1,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  itemTitle: {
    fontSize: 16,
  },
});
