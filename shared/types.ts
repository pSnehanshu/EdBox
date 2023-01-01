import type {
  School,
  User,
  Message,
} from "../backend/node_modules/@prisma/client";
import type { GroupIdentifier } from "../backend/utils/group-identifier";
// import { z } from "../backend/node_modules/zod";

// type GroupIdentifier = z.infer<typeof CustomGroupIdentifier> | ;

export interface ServerToClientEvents {
  newMessage: (msg: Message) => void;
}

export interface ClientToServerEvents {
  messageCreate: (groupIdentifier: GroupIdentifier, text: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: User;
  school: School;
}
