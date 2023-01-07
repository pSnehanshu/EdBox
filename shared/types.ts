import type {
  School,
  User as DBUser,
} from "../backend/node_modules/@prisma/client";
import type { inferRouterOutputs } from "../backend/node_modules/@trpc/server";
import type { AppRouter } from "../backend/trpc";

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Message = ArrayElement<
  inferRouterOutputs<AppRouter>["school"]["messaging"]["fetchGroupMessages"]["messages"]
>;

export interface Group {
  name: string;
  identifier: string;
}

export type User = inferRouterOutputs<AppRouter>["auth"]["whoami"];

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
  school: School;
}
