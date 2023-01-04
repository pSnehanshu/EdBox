import { WebSQLDatabase } from "expo-sqlite";
import { Subject } from "rxjs";
import type { Message } from "../../shared/types";
import { SocketClient } from "../types";

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
