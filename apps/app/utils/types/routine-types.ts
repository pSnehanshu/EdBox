import { ComponentProps } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { TabView } from "react-native-tab-view";
import Timeline from "react-native-timeline-flatlist";
import type {
  DayOfWeek,
  StudentRoutinePeriod,
  TeacherRoutinePeriod,
} from "schooltalk-shared/types";

export type RoutinePeriod = TeacherRoutinePeriod | StudentRoutinePeriod;

export type TabRoute = { key: DayOfWeek; title: string };
export type RenderSceneProp = ComponentProps<
  typeof TabView<TabRoute>
>["renderScene"];
export type RenderTabBarProp = NonNullable<
  ComponentProps<typeof TabView<TabRoute>>["renderTabBar"]
>;
export type TimelineOnPressProp = NonNullable<
  ComponentProps<typeof Timeline>["onEventPress"]
>;
export interface DayRoutineProps<RoleType extends RoutinePeriod> {
  day: DayOfWeek;
  periods: RoleType[];
  onRefresh: () => void;
  isFetching: boolean;
}
export type GapPeriod = {
  is_gap: true;
  start_hour: number;
  start_min: number;
  end_hour: number;
  end_min: number;
};

/** Copied from https://github.com/Eugnis/react-native-timeline-flatlist/blob/9f08aaaf50fcd95398e1b47d0d39f063e7d2825f/lib/index.d.ts#L5-L17 */
export type TimelineData<T = unknown> = {
  time?: string;
  title?: string;
  description?: any;
  lineWidth?: number;
  lineColor?: string;
  eventContainerStyle?: StyleProp<ViewStyle>;
  circleSize?: number;
  circleColor?: string;
  dotColor?: string;
  icon?: string | React.ReactNode;
  position?: "left" | "right";
  data: T;
};

export const RoutineRoutes: TabRoute[] = [
  { key: "mon", title: "Monday" },
  { key: "tue", title: "Tuesday" },
  { key: "wed", title: "Wednesday" },
  { key: "thu", title: "Thursday" },
  { key: "fri", title: "Friday" },
  { key: "sat", title: "Saturday" },
  { key: "sun", title: "Sunday" },
];
