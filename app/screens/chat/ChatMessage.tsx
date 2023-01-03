import { useCurrentUser } from "../../utils/auth";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../../backend/trpc";
import { format } from "date-fns";
import { Text } from "../../components/Themed";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Message = ArrayElement<
  inferRouterOutputs<AppRouter>["school"]["messaging"]["fetchGroupMessages"]
>;

interface ChatMessageProps {
  message: Message;
}
export default function ChatMessage({ message }: ChatMessageProps) {
  const user = useCurrentUser();

  const isSentByMe = user.id === message.sender_id;
  const time = format(new Date(message.created_at), "h:mm aaa");

  return (
    <Text>
      {isSentByMe ? "You" : message.Sender.name}: {message.text} ({time})
    </Text>
  );
}
