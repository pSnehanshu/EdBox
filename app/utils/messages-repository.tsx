import { WebSQLDatabase } from "expo-sqlite";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import type { Message } from "../../shared/types";
import { SocketClient } from "../types";
import { useDB } from "./db";
import { useSocket } from "./socketio";
import { trpc } from "./trpc";
import _ from "lodash";
import BigInt from "big-integer";

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
      this.socket.emit(
        "messageCreate",
        message.groupIdentifier,
        message.text,
        (createdMessage) => {
          this.getGroupMessageObservable(message.groupIdentifier).next(
            createdMessage
          );
        }
      );
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

  useFetchGroupMessages(groupIdentifier: string, limit = 20) {
    const [finalMessages, setFinalMessages] = useState<Message[]>([]);
    const utils = trpc.useContext();

    function setMessagesReconcile(messages: Message[]) {
      setFinalMessages((existingMessages) => {
        // // Assume both `existingMessages` and `messages` are
        // // ordered based on `sort_key` in decreasing order.
        // // We need to merge these two arrays, and the final array
        // // must be ordered based on `sort_key` in decreasing order.
        // // If two items in the arrays contain the same `sort_key`,
        // // the final array should contain the one in the `messages` array.
        // // Ensure none are empty
        // if (messages.length < 1) return existingMessages;
        // if (existingMessages.length < 1) return messages;
        // // If they don't have overlap, then it's easy
        // if (
        //   BigInt(messages.at(0)!.sort_key) <
        //   BigInt(existingMessages.at(-1)!.sort_key)
        // ) {
        //   return existingMessages.concat(messages);
        // } else if (
        //   BigInt(existingMessages.at(0)!.sort_key) <
        //   BigInt(messages.at(-1)!.sort_key)
        // ) {
        //   return messages.concat(existingMessages);
        // }
        // // There is definitely overlap
        // const combined: Message[] = existingMessages;
        // return combined;

        // TODO: Optimize (read above)
        return _.chain(existingMessages.concat(messages))
          .sortBy((m) => BigInt(m.sort_key))
          .sortedUniqBy((m) => m.sort_key)
          .reverse()
          .value();
      });
    }

    useEffect(() => {
      // 1. Fetch from SQLite
      this.fetchMessagesFromDB({
        groupIdentifier,
        limit,
      })
        .then(setMessagesReconcile) // 2. Return this list
        .catch((err) => console.error(err));
    }, [setFinalMessages, groupIdentifier, limit]);

    useEffect(() => {
      // 3. Fetch from tRPC
      utils.school.messaging.fetchGroupMessages
        .fetch({
          groupIdentifier,
          limit,
        })
        .then((response) =>
          /* 4. Insert these messages into SQLite */ this.insertMessagesToDB(
            response.messages
          )
        )
        .then(() =>
          /* 5. Refetch from SQLite and return */ this.fetchMessagesFromDB({
            groupIdentifier,
            limit,
          })
        )
        .then(setMessagesReconcile); // 6. Return this list
    }, [setFinalMessages, groupIdentifier, limit]);

    this.useGroupMessageReceived(groupIdentifier, (newMessage) => {
      setFinalMessages((m) => [newMessage, ...m]);
    });

    return {
      messages: finalMessages,
      fetchNextPage() {
        const cursor = _.last(finalMessages)?.sort_key;
        if (!cursor) return;

        // TODO: Fetch using cursor
      },
    };
  }

  /**
   * Fetch messages from SQLite. Messages in SQLite are considered to be partial, and are often deleted.
   */
  fetchMessagesFromDB(params: {
    groupIdentifier: string;
    limit?: number;
    cursor?: string | number;
  }): Promise<Message[]> {
    const args: Array<string | number | null> = [];
    let sql = `SELECT * FROM messages WHERE `;

    // First param is group identifier
    sql += "group_identifier = ? ";
    args.push(params.groupIdentifier);

    // Second param cursor if defined
    if (params.cursor) {
      sql += "AND sort_key >= ? ";
      args.push(params.cursor);
    }

    // Third param is limit
    sql += "ORDER BY sort_key DESC LIMIT ?;";
    args.push(params.limit ?? 20);

    // Finally, run the query to fetch the result
    return new Promise((resolve, reject) => {
      this.db.readTransaction((tx) => {
        tx.executeSql(
          sql,
          args,
          (tx, result) => {
            const localMessages = result.rows._array.map(
              (row) => JSON.parse(row.obj) as Message
            );
            resolve(localMessages);
          },
          (tx, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  /**
   * Insert messages (and groups) to SQLite.
   * @param messages
   */
  insertMessagesToDB(messages: Message[]): Promise<void> {
    if (messages.length < 1) return Promise.resolve();

    const insertGroupsArgs: Array<string | number | null> = [];
    const insertGroupsSQL = `INSERT OR IGNORE INTO groups (id, obj) VALUES ${messages
      .map((m) => {
        // TODO: Insert the actual group object, and change to INSERT OR REPLACE
        insertGroupsArgs.push(m.group_identifier, "{}");
        return "(?,?)";
      })
      .join(",")}`;

    const insertMessagesArgs: Array<string | number | null> = [];
    const insertMessagesSQL = `INSERT OR REPLACE INTO messages (id, obj, created_at, group_identifier, sort_key) VALUES ${messages
      .map((m) => {
        insertMessagesArgs.push(
          m.id,
          JSON.stringify(m),
          m.created_at,
          m.group_identifier,
          m.sort_key
        );
        return "(?,?,?,?,?)";
      })
      .join(",")}`;

    return new Promise<void>((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // 1. Create all unknown groups
          tx.executeSql(insertGroupsSQL, insertGroupsArgs);

          // 2. Insert the messages
          tx.executeSql(insertMessagesSQL, insertMessagesArgs);
        },
        reject,
        resolve
      );
    });
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

  if (!messages.current) return null;

  return (
    <MessagesRepositoryContext.Provider value={messages.current}>
      {children}
    </MessagesRepositoryContext.Provider>
  );
}

export function useMessages() {
  const messages = useContext(MessagesRepositoryContext);
  return messages!;
}
