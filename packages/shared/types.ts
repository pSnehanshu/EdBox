import type {
  School as DBSchool,
  User as DBUser,
  SchoolStaff,
  GroupActivity,
} from "@prisma/client";
import type { z } from "zod";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../apps/backend/trpc";
import type { Context } from "../../apps/backend/trpc/context";
import { ActivityPayloadSchema } from "./group-schemas";

export type Nullable<T> = T | null | undefined | void;

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export interface Group {
  name: string;
  identifier: string;
}

export type User = RouterOutput["profile"]["me"];

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

export type Gender = NonNullable<RouterInput["profile"]["update"]["gender"]>;
export type Saluation = NonNullable<
  RouterInput["profile"]["update"]["salutation"]
>;

/** Blood Groups as stored in DB */
export type DBBloodGroup = NonNullable<
  RouterInput["profile"]["update"]["blood_group"]
>;

/** Blood Groups as rendered on screen */
export type UIBloodGroup =
  | "A+"
  | "B+"
  | "AB+"
  | "O+"
  | "A-"
  | "B-"
  | "AB-"
  | "O-"
  | "Others"
  | undefined;

export interface IGroupActivity extends GroupActivity {
  payload: z.infer<typeof ActivityPayloadSchema>;
}

export interface ServerToClientEvents {
  newActivity: (activity: IGroupActivity) => void;
  addedToGroup: (groupId: string) => void;
  removedFromGroup: (groupId: string) => void;
}

export interface ClientToServerEvents {
  joinGroupRoom: (groupId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InterServerEvents {}

export interface SocketData {
  user: DBUser & { Staff: SchoolStaff | null };
  school: DBSchool;
}
