import { WebSQLDatabase } from "expo-sqlite";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import type { Message } from "../../shared/types";
import { SocketClient } from "../types";
import { useDB } from "./db";
import { useSocket } from "./socketio";

export class MessagesRepository {
  /** The observable representing all received messages */
  readonly allMessagesObservable = new Subject<Message>();

  /** Group wise observables */
  readonly groupMessagesObservableMap = new Map<string, Subject<Message>>();

  readonly composerObservable = new Subject<{
    groupIdentifier: string;
    text: string;
  }>();

  constructor(private db: WebSQLDatabase, private socket: SocketClient) {
    this.socket.on("newMessage", (msg) => this.allMessagesObservable.next(msg));

    // Forward group messages to group observers
    this.allMessagesObservable.subscribe((message) => {
      const groupObservable = this.groupMessagesObservableMap.get(
        message.group_identifier
      );

      if (groupObservable) {
        groupObservable.next(message);
      }
    });

    // When new message is created
    this.composerObservable.subscribe((message) => {
      this.socket.emit("messageCreate", message.groupIdentifier, message.text);
    });
  }

  /**
   * Get an observable for a group
   * @param groupIdentifier
   */
  getGroupMessageObservable(groupIdentifier: string) {
    // Observable already exists, return it
    if (this.groupMessagesObservableMap.has(groupIdentifier)) {
      return this.groupMessagesObservableMap.get(groupIdentifier)!;
    }

    // Create new observable
    const groupObservable = new Subject<Message>();
    this.groupMessagesObservableMap.set(groupIdentifier, groupObservable);

    return groupObservable;
  }

  useGroupMessageReceived(
    groupIdentifier: string,
    onReceive: (message: Message) => void
  ) {
    useEffect(() => {
      const observable = this.getGroupMessageObservable(groupIdentifier);

      const subscription = observable.subscribe((message) => {
        onReceive(message);
      });

      return () => {
        subscription.unsubscribe();
      };
    }, []);
  }

  /**
   * Send a new message
   * @param groupIdentifier
   * @param text
   */
  sendMessage(groupIdentifier: string, text: string) {
    this.composerObservable.next({
      groupIdentifier,
      text,
    });
  }
}

const MessagesRepositoryContext = createContext<MessagesRepository | null>(
  null
);

interface MessagesProviderProp {
  children: JSX.Element | JSX.Element[];
}
export function MessagesProvider({ children }: MessagesProviderProp) {
  const db = useDB();
  const socket = useSocket();
  const messages = useRef<MessagesRepository>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (socket.isConnected && !isLoaded) {
      messages.current = new MessagesRepository(db, socket.client);
      setIsLoaded(true);
    }
  }, [socket.isConnected]);

  return (
    <MessagesRepositoryContext.Provider value={messages.current ?? null}>
      {children}
    </MessagesRepositoryContext.Provider>
  );
}

export function useMessages() {
  const messages = useContext(MessagesRepositoryContext);
  return messages!;
}
