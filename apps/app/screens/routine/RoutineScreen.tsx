import { ComponentProps, useCallback, useState, memo } from "react";
import { useWindowDimensions } from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import Spinner from "react-native-loading-spinner-overlay";
import { format } from "date-fns";
import { DayOfWeek, Routine } from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import { Text } from "../../components/Themed";
import useColorScheme from "../../utils/useColorScheme";

type TabRoute = { key: DayOfWeek; title: string };
type RenderSceneProp = ComponentProps<typeof TabView<TabRoute>>["renderScene"];
type RenderTabBarProp = NonNullable<
  ComponentProps<typeof TabView<TabRoute>>["renderTabBar"]
>;
interface DayRoutineProps {
  day: DayOfWeek;
  periods: Routine["mon"];
}

const DayRoutine = memo(({ day, periods }: DayRoutineProps) => {
  return <Text style={{ flex: 1 }}>{JSON.stringify(periods, null, 2)}</Text>;
});

const routes: TabRoute[] = [
  { key: "mon", title: "Monday" },
  { key: "tue", title: "Tuesday" },
  { key: "wed", title: "Wednesday" },
  { key: "thu", title: "Thursday" },
  { key: "fri", title: "Friday" },
  { key: "sat", title: "Saturday" },
  { key: "sun", title: "Sunday" },
];

export default function RoutineScreen() {
  const routineQuery = trpc.school.routine.fetchForTeacher.useQuery();
  const layout = useWindowDimensions();
  const color = useColorScheme();
  const [index, setIndex] = useState(
    // Calculating the index of day-of-week. 0-Mon,1-Tue,so on...
    () => parseInt(format(new Date(), "i"), 10) - 1
  );
  const renderScene = useCallback<RenderSceneProp>(
    ({ route }) => (
      <DayRoutine
        day={route.key}
        periods={
          routineQuery.isFetched ? routineQuery.data?.[route.key] ?? [] : []
        }
      />
    ),
    [routineQuery.isFetched]
  );
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
    [color]
  );

  if (routineQuery.isLoading) return <Spinner visible />;
  if (routineQuery.isError) return <Text>Error occured!</Text>;

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      lazy
    />
  );
}
