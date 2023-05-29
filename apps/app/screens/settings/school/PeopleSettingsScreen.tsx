import { ComponentProps, useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import { StaticRole } from "schooltalk-shared/misc";
import type { ListRenderItem } from "@shopify/flash-list";
import { User } from "schooltalk-shared/types";
import { List, Text, View } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";
import useColorScheme from "../../../utils/useColorScheme";

type TabRoute = { key: keyof typeof StaticRole; title: string };
type RenderTabBarProp = NonNullable<
  ComponentProps<typeof TabView<TabRoute>>["renderTabBar"]
>;

const Routes: TabRoute[] = [
  {
    key: "teacher",
    title: "Teachers",
  },
  {
    key: "student",
    title: "Students",
  },
  {
    key: "staff",
    title: "Staff members",
  },
  {
    key: "parent",
    title: "Parents",
  },
  {
    key: "principal",
    title: "Principal",
  },
  {
    key: "vice_principal",
    title: "Vice Principal",
  },
];

interface PeopleListProps {
  role: StaticRole;
}
function PeopleList({ role }: PeopleListProps) {
  const [page] = useState(1);
  const peopleQuery = trpc.school.people.fetchPeople.useQuery({
    role,
    page,
  });

  const renderItem = useCallback<ListRenderItem<User>>(({ item: user }) => {
    return (
      <View style={styles.personContainer}>
        <Text>{user.name}</Text>
      </View>
    );
  }, []);

  return (
    <List
      onRefresh={peopleQuery.refetch}
      refreshing={peopleQuery.isFetching}
      estimatedItemSize={styles.personContainer.height}
      data={peopleQuery.data ?? []}
      renderItem={renderItem}
    />
  );
}

export function PeopleSettingsScreen() {
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const color = useColorScheme();

  const renderTabBar = useCallback<RenderTabBarProp>(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: "#09c",
        }}
        style={{
          backgroundColor: color === "dark" ? "black" : "white",
          width: "auto",
        }}
        labelStyle={{
          color: color === "dark" ? "white" : "black",
        }}
        activeColor="#09c"
        scrollEnabled
      />
    ),
    [color],
  );

  return (
    <TabView
      navigationState={{ index, routes: Routes }}
      renderScene={({ route }) => <PeopleList role={StaticRole[route.key]} />}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      lazy
    />
  );
}

const styles = StyleSheet.create({
  personContainer: {
    height: 50,
    padding: 8,
  },
});
