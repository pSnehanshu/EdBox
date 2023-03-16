import type { School as DBSchool, User as DBUser } from "@prisma/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../apps/backend/trpc";
import type { Context } from "../../apps/backend/trpc/context";

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

export type UnserializedUser = Extract<
  Context,
  { session: object }
>["session"]["User"];

export type School = RouterOutput["school"]["schoolBasicInfo"];

export type TeacherRoutine =
  RouterOutput["school"]["routine"]["fetchForTeacher"];
export type TeacherRoutinePeriod = ArrayElement<
  NonNullable<TeacherRoutine["mon"]>
>;

export type StudentRoutine =
  RouterOutput["school"]["routine"]["fetchForStudent"];
export type StudentRoutinePeriod = ArrayElement<
  NonNullable<StudentRoutine["mon"]>
>;

export type DayOfWeek = TeacherRoutinePeriod["day_of_week"];

export type Student = ArrayElement<
  RouterOutput["school"]["routine"]["fetchPeriodStudents"]["students"]
>;

export type ExamItem = ArrayElement<
  RouterOutput["school"]["exam"]["fetchExamsAndTestsForStudent"]
>;

export type ClassWithSections = ArrayElement<
  RouterOutput["school"]["class"]["fetchClassesAndSections"]
>;

export type Section = ArrayElement<ClassWithSections["Sections"]>;

export interface ServerToClientEvents {
  newMessage: (msg: Message) => void;
}

export interface ClientToServerEvents {
  messageCreate: (
    groupIdentifier: string,
    text: string,
    callback: (message: Message) => void,
  ) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: DBUser;
  school: DBSchool;
}
