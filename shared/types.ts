import type {
  School,
  User,
  Message,
} from "../backend/node_modules/@prisma/client";

export interface ServerToClientEvents {
  newMessage: (msg: Message) => void;
}

export interface ClientToServerEvents {
  messageCreate: (groupIdentifier: string, text: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: User;
  school: School;
}
