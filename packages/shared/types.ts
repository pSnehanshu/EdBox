import type {
  School as DBSchool,
  User as DBUser,
  SchoolStaff,
} from "@prisma/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../apps/backend/trpc";
import type { Context } from "../../apps/backend/trpc/context";
import type { FilePermissionsInput } from "./misc";

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

/**
 * Because messages are cached in SQLite, this type may not always
 * be correct for old messages if the structure of a message changed
 * e.g. Addition or removal of a field. Hence it's safer to mark this
 * as `Partial<...>` so that while using any of the properties, the
 * developer is forced to manually check if a property exists or not.
 */
export type Message = Partial<
  ArrayElement<
    RouterOutput["school"]["messaging"]["fetchGroupMessages"]["messages"]
  >
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

export type ExamTest = RouterOutput["school"]["exam"]["getTestInfo"];

export type ClassWithSections = ArrayElement<
  RouterOutput["school"]["class"]["fetchClassesAndSections"]
>;

export type Section = ArrayElement<ClassWithSections["Sections"]>;

export type Homework = RouterOutput["school"]["homework"]["fetchHomework"];

export type Subject = ArrayElement<
  RouterOutput["school"]["subject"]["fetchSubjects"]
>;

export type Attachment = ArrayElement<Homework["Attachments"]>;

export type UploadedFile = RouterOutput["school"]["attachment"]["fetchFile"];

export type UploadPermission =
  RouterOutput["school"]["attachment"]["requestPermission"]["permission"];

export interface ServerToClientEvents {
  newMessage: (msg: Message) => void;
}

export interface ClientToServerEvents {
  messageCreate: (
    groupIdentifier: string,
    text: string,
    files: FilePermissionsInput[],
    callback: (message: Message) => void,
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {}

export interface SocketData {
  user: DBUser & { Staff: SchoolStaff | null };
  school: DBSchool;
}
