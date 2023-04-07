import type { inferRouterOutputs } from "@trpc/server";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Dialog, BottomSheet, ListItem } from "@rneui/themed";
import Toast from "react-native-toast-message";
import type { ListRenderItem } from "@shopify/flash-list";
import type { ArrayElement } from "schooltalk-shared/types";
import type { AppRouter } from "../../../../backend/trpc";
import { List, Text, TextInput, View } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";
import useColorScheme from "../../../utils/useColorScheme";
import { useConfig } from "../../../utils/config";

type ClassStd = ArrayElement<
  inferRouterOutputs<AppRouter>["school"]["class"]["fetchClassesAndSections"]
>;

type Section = ArrayElement<ClassStd["Sections"]>;

interface TheClassProps {
  classStd: ClassStd;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPress: () => void;
}
function TheClass({
  classStd,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onPress,
}: TheClassProps) {
  const className = classStd.name ?? classStd.numeric_id;
  const getSectionName = useCallback(
    (section: ArrayElement<ClassStd["Sections"]>) =>
      section.name ?? section.numeric_id,
    [],
  );
  const colorScheme = useColorScheme();

  const isOnTop = index === 0;
  const isOnBottom = index === total - 1;

  const color = colorScheme === "dark" ? "white" : "black";

  return (
    <Pressable
      style={({ pressed }) => ({
        ...styles.theClass,
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={onPress}
    >
      <View style={styles.classInfo}>
        <Text>Class {className}</Text>
        <Text>
          Sections: {classStd.Sections.map(getSectionName).join(", ")}
        </Text>
      </View>

      <View style={styles.classActions}>
        <View style={styles.classActionsMove}>
          <AntDesign.Button
            onPress={onMoveUp}
            name="caretup"
            iconStyle={{ color: isOnTop ? "gray" : color }}
            style={styles.classActionsMoveBtn}
          />
          <AntDesign.Button
            onPress={onMoveDown}
            name="caretdown"
            iconStyle={{ color: isOnBottom ? "gray" : color }}
            style={styles.classActionsMoveBtn}
          />
        </View>
      </View>
    </Pressable>
  );
}

interface SectionsManagerProps {
  classStd: ClassStd | null | undefined;
  onClose: () => void;
  onSubmit: (sections: ClassStd["Sections"]) => void;
}
function SectionsManager({
  classStd,
  onClose,
  onSubmit,
}: SectionsManagerProps) {
  const color = useColorScheme();
  const givenSections: Section[] = classStd?.Sections ?? [];
  const [isAddNew, setAddNew] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [editSection, setEditSection] = useState<Section | null>(null);

  return (
    <Dialog
      overlayStyle={{
        backgroundColor: color === "dark" ? "#222" : "white",
      }}
      isVisible={!!classStd}
      onBackdropPress={onClose}
    >
      {classStd ? (
        <View style={styles.sectionWrapper}>
          <Dialog.Title
            titleStyle={{
              color: color === "dark" ? "white" : "black",
            }}
            title={`Class ${classStd.name ?? classStd.numeric_id}`}
          />

          <List
            keyExtractor={(s) => s.numeric_id.toString()}
            data={givenSections}
            estimatedItemSize={50}
            renderItem={({ item }) => {
              return (
                <View style={styles.sectionContainer}>
                  {editSection?.numeric_id === item.numeric_id ? (
                    <>
                      <View style={styles.sectionName}>
                        <Text>Section</Text>
                        <TextInput
                          value={
                            editSection.name ??
                            editSection.numeric_id.toString()
                          }
                          onChangeText={(name) => {
                            setEditSection((s) => {
                              if (s) {
                                return {
                                  ...s,
                                  name,
                                };
                              } else return null;
                            });
                          }}
                          autoFocus
                        />
                      </View>
                      <View style={styles.sectionActions}>
                        <MaterialCommunityIcons.Button
                          name="check"
                          backgroundColor="transparent"
                        />
                        <MaterialCommunityIcons.Button
                          name="close"
                          backgroundColor="transparent"
                          onPress={() => setEditSection(null)}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sectionName}>
                        Section {item.name ?? item.numeric_id}
                      </Text>
                      <View style={styles.sectionActions}>
                        <MaterialCommunityIcons.Button
                          name="lead-pencil"
                          backgroundColor="transparent"
                          onPress={() => setEditSection(item)}
                        />
                      </View>
                    </>
                  )}
                </View>
              );
            }}
            ListFooterComponent={
              <View style={styles.sectionContainer}>
                {isAddNew ? (
                  <>
                    <View style={styles.sectionName}>
                      <Text>Section</Text>
                      <TextInput
                        value={newSectionName}
                        onChangeText={setNewSectionName}
                        autoFocus
                      />
                    </View>

                    <View style={styles.sectionActions}>
                      <MaterialCommunityIcons.Button
                        name="check"
                        backgroundColor="transparent"
                      />
                      <MaterialCommunityIcons.Button
                        name="close"
                        backgroundColor="transparent"
                        onPress={() => {
                          setAddNew(false);
                          setNewSectionName("");
                        }}
                      />
                    </View>
                  </>
                ) : (
                  <MaterialCommunityIcons.Button
                    name="card-plus-outline"
                    backgroundColor="transparent"
                    onPress={() => setAddNew(true)}
                  >
                    Add new section
                  </MaterialCommunityIcons.Button>
                )}
              </View>
            }
            keyboardShouldPersistTaps="always"
          />

          <Dialog.Actions>
            <Dialog.Button
              title="SAVE"
              onPress={() => {}}
              buttonStyle={{
                backgroundColor: "#09c",
                borderRadius: 3,
              }}
              containerStyle={{
                width: 100,
              }}
              titleStyle={{ color: "white" }}
            />
            <Dialog.Button
              title="cancel"
              type="clear"
              titleStyle={{ color: "red" }}
              onPress={onClose}
            />
          </Dialog.Actions>
        </View>
      ) : null}
    </Dialog>
  );
}

export default function ClassSectionSettingsScreen() {
  const config = useConfig();
  const [isFetching, setIsFetching] = useState(false);
  const [classes, _setClasses] = useState<ClassStd[]>([]);
  const utils = trpc.useContext();
  const [manageClass, setManageClass] = useState<ClassStd | null>(null);
  const [manageSections, setManageSections] = useState(false);

  const setClasses = useCallback((newClasses: ClassStd[]) => {
    _setClasses((classes) => {
      /** The classes that already existed, but aren't included in `newClasses`. */
      const existingOldClasses = classes.filter(
        (ec) =>
          newClasses.findIndex((nc) => ec.numeric_id === nc.numeric_id) < 0,
      );

      return _.chain(existingOldClasses)
        .concat(newClasses)
        .sortBy((c) => c.order)
        .sortedUniqBy((c) => c.numeric_id)
        .value();
    });
  }, []);

  const swapClassOrder = useCallback(
    (class1index: number, class2index: number) => {
      _setClasses((classes) => {
        const class1 = classes[class1index];
        const class2 = classes[class2index];
        if (!class1 || !class2) {
          console.warn(
            `Invalid class index received 1:${class1index} 2:${class2index}`,
          );
          return classes;
        }

        // Swap position
        const copy = classes.slice();
        copy[class1index] = class2;
        copy[class2index] = class1;

        // Swap order
        const tmp = class1.order;
        class1.order = class2.order;
        class2.order = tmp;

        Toast.show({
          position: "bottom",
          text1: `Class ${class1.name ?? class1.numeric_id} was moved ${
            class1index < class2index ? "down" : "up"
          }`,
          visibilityTime: 1000,
          type: "info",
        });

        return copy;
      });
    },
    [],
  );

  const fetchClasses = useCallback(async (schoolId: string) => {
    try {
      setIsFetching(true);
      const classes =
        await utils.client.school.class.fetchClassesAndSections.query({
          schoolId,
        });

      setClasses(classes);
    } catch (error) {
      console.error(error);
    }
    setIsFetching(false);
  }, []);

  useEffect(() => {
    fetchClasses(config.schoolId);
  }, [config.schoolId]);

  const renderItem = useCallback<ListRenderItem<ClassStd>>(
    ({ item, index }) => {
      return (
        <TheClass
          classStd={item}
          index={index}
          total={classes.length}
          onMoveUp={() => swapClassOrder(index, index - 1)}
          onMoveDown={() => swapClassOrder(index, index + 1)}
          onPress={() => setManageClass(item)}
        />
      );
    },
    [classes.length],
  );

  const manageClassOptions = useMemo<
    Array<{ title: string; color?: string; onPress: () => void }>
  >(() => {
    return [
      {
        title: "Edit class",
        onPress() {
          //
        },
      },
      {
        title: "Manage sections",
        onPress() {
          setManageSections(true);
        },
      },
      {
        title: "Delete",
        onPress() {
          //
        },
        color: "red",
      },
    ];
  }, []);

  return (
    <View style={styles.container}>
      <SectionsManager
        classStd={manageSections ? manageClass : null}
        onClose={() => {
          setManageSections(false);
          setManageClass(null);
        }}
        onSubmit={(sections) => {}}
      />

      <BottomSheet
        modalProps={{}}
        isVisible={!!manageClass}
        onBackdropPress={() => setManageClass(null)}
      >
        {manageClassOptions.map((item, i) => (
          <Pressable onPress={item.onPress} key={i}>
            {({ pressed }) => (
              <ListItem>
                <ListItem.Content>
                  <ListItem.Title
                    style={{ color: item.color, opacity: pressed ? 0.5 : 1 }}
                  >
                    <Text>{item.title}</Text>
                  </ListItem.Title>
                </ListItem.Content>
              </ListItem>
            )}
          </Pressable>
        ))}
      </BottomSheet>

      <List
        onRefresh={() => fetchClasses(config.schoolId)}
        refreshing={isFetching}
        estimatedItemSize={94}
        data={classes}
        keyExtractor={(item) => item.numeric_id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  theClass: {
    justifyContent: "center",
    padding: 8,
    flexDirection: "row",
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    alignItems: "center",
  },
  classInfo: {
    width: "50%",
  },
  classActions: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  classActionsMove: {
    padding: 2,
  },
  classActionsMoveBtn: {},
  sectionWrapper: {
    minHeight: 400,
  },
  sectionContainer: {
    flexDirection: "row",
  },
  sectionName: {
    flexGrow: 1,
    flexDirection: "row",
  },
  sectionActions: {
    flexDirection: "row",
  },
});
