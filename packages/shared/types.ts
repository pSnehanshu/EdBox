import type { School as DBSchool, User as DBUser } from "@prisma/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../apps/backend/trpc";

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type Message = ArrayElement<
  RouterOutput["school"]["messaging"]["fetchGroupMessages"]["messages"]
>;

export interface Group {
  name: string;
  identifier: string;
}

export type User = RouterOutput["auth"]["whoami"];

export type School = RouterOutput["school"]["schoolBasicInfo"];

export type Routine = RouterOutput["school"]["routine"]["fetchForTeacher"];

export type RoutinePeriod = ArrayElement<NonNullable<Routine["mon"]>>;

export type DayOfWeek = RoutinePeriod["day_of_week"];

export type Student = ArrayElement<
  RouterOutput["school"]["routine"]["fetchPeriodStudents"]["students"]
>;

export interface ServerToClientEvents {
  newMessage: (msg: Message) => void;
}

export interface ClientToServerEvents {
  messageCreate: (
    groupIdentifier: string,
    text: string,
    callback: (message: Message) => void
  ) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: DBUser;
  school: DBSchool;
}
