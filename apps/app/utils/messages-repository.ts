import { ResultSet, WebSQLDatabase } from "expo-sqlite";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Subject } from "rxjs";
import type { Group, Message } from "schooltalk-shared/types";
import { allSettled } from "schooltalk-shared/misc";
import { SocketClient } from "../types";
import { useDB } from "./db";
import { useSocket } from "./socketio";
import { trpc } from "./trpc";
import _ from "lodash";
import BigInt from "big-integer";
import Toast from "react-native-toast-message";
import { navigationRef } from "../navigation/navRef";

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

    // Show message alert
    this.allMessagesObservable.subscribe((message) => {
      // TODO: Show group info
      Toast.show({
        type: "info",
        text1: `Message from ${message.Sender.name}`,
        text2: message.text,
        onPress() {
          navigationRef.navigate("ChatWindow", {
            identifier: message.group_identifier,
            name: "",
          });

          Toast.hide();
        },
      });
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
    }, [groupIdentifier]);
  }

  useFetchGroupMessages(groupIdentifier: string, limit = 20) {
    const utils = trpc.useContext();
    const [finalMessages, setFinalMessages] = useState<Message[]>([]);
    const [nextCursor, setNextCursor] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const setMessagesReconcile = useCallback(
      (messages: Message[], cursor?: string) => {
        setNextCursor(cursor);

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
          // Give more preference to `messages` because it is likely fresher
          return _.chain(messages.concat(existingMessages))
            .sortBy((m) => BigInt(m.sort_key))
            .sortedUniqBy((m) => m.sort_key)
            .reverse()
            .value();
        });
      },
      []
    );

    const fetchMessages = useCallback(
      async (cursor?: string) => {
        try {
          // Start loading
          setIsLoading(true);

          const serverPromise =
            utils.client.school.messaging.fetchGroupMessages.query({
              groupIdentifier,
              limit,
              cursor,
            });

          // 1. Fetch from local
          const dbMessages = await this.fetchMessagesFromDB({
            groupIdentifier,
            limit,
            cursor,
          });

          // 2. Return local data
          setMessagesReconcile(dbMessages.messages, dbMessages.cursor);

          // 3. Fetch from Server
          const serverMessages = await serverPromise;

          // 4. Save server data into local
          await this.insertMessagesToDB(serverMessages.messages, utils);

          // 5. Re-fetch from local
          const dbMessages2 = await this.fetchMessagesFromDB({
            groupIdentifier,
            limit,
            cursor,
          });

          // 6. Return fresh local data
          setMessagesReconcile(dbMessages2.messages, serverMessages.cursor);
        } catch (error) {
          console.error("fetchMessages Error:", error);
        } finally {
          // Loading finish
          setIsLoading(false);
        }
      },
      [groupIdentifier, limit, setMessagesReconcile]
    );

    const fetchNextPage = useCallback(() => {
      if (nextCursor && !isLoading) {
        fetchMessages(nextCursor);
      }
    }, [fetchMessages, nextCursor, isLoading]);

    useEffect(() => {
      fetchMessages(nextCursor);
    }, [fetchMessages]);

    useEffect(() => {
      setFinalMessages([]);
      setNextCursor(undefined);
      fetchMessages();
    }, [groupIdentifier]);

    this.useGroupMessageReceived(groupIdentifier, (newMessage) => {
      setFinalMessages((m) => [newMessage, ...m]);
    });

    return {
      messages: finalMessages,
      fetchNextPage,
      hasMore: !!nextCursor,
      isLoading,
    };
  }

  /**
   * Fetch messages from SQLite. Messages in SQLite are considered to be partial, and are often deleted.
   */
  fetchMessagesFromDB(params: {
    groupIdentifier: string;
    limit?: number;
    cursor?: string | number;
  }): Promise<{ messages: Message[]; cursor?: string }> {
    const args: Array<string | number | null> = [];
    let sql = `SELECT * FROM messages WHERE `;

    // First param is group identifier
    sql += "group_identifier = ? ";
    args.push(params.groupIdentifier);

    // Second param cursor if defined
    if (params.cursor) {
      sql += "AND sort_key <= ? ";
      args.push(params.cursor);
    }

    // Third param is limit
    const limit = params.limit ?? 20;
    sql += "ORDER BY sort_key DESC LIMIT ?;";
    args.push(limit + 1 /* +1 for cursor */);

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

            let cursor: string | undefined = undefined;
            if (localMessages.length > limit) {
              const last = localMessages.pop();
              cursor = last?.sort_key;
            }

            resolve({ messages: localMessages, cursor });
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
  insertMessagesToDB(
    messages: Message[],
    trpcUtils?: ReturnType<typeof trpc.useContext>
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (messages.length < 1) return resolve();

      // Fetch missing group infos
      const insertGroupsArgs: Array<string | number | null> = [];
      let insertGroupsSQL = "";

      // Flag to check whether `fetchUnseenGroupsInfo` was executed sucessfully
      let groupsInfoFetchedFromServer = false;

      // If `trpcUtils` isn't passed down, we can't fetch from server, hence skip
      if (trpcUtils) {
        try {
          // INSERT OR "REPLACE" because we are fetchig fresh data from server.
          // Even if record already exists, replace because we have fresher data
          insertGroupsSQL = `INSERT OR REPLACE INTO groups (id, obj) VALUES `;

          // Fetch all unseen groups, groups that don't exist in the local SQLite
          const groupsToInsert = await this.fetchUnseenGroupsInfo(
            messages.map((m) => m.group_identifier),
            trpcUtils
          );

          // If there are any, generate SQL to insert their info
          if (Object.values(groupsToInsert).length > 0) {
            insertGroupsSQL += Object.entries(groupsToInsert)
              .map(([identifier, obj]) => {
                insertGroupsArgs.push(
                  identifier,
                  obj ? JSON.stringify(obj) : "{}"
                );
                return "(?,?)";
              })
              .join(",");

            groupsInfoFetchedFromServer = true;
          }
        } catch (error) {
          console.error("Failed to fetch groups from DB", error);
          groupsInfoFetchedFromServer = false;
        }
      }

      // If we didn't (or failed to) fetch groups from server, insert blank objects
      if (!groupsInfoFetchedFromServer) {
        // INSERT OR "IGNORE"... because here we're trying to insert empty objects.
        // Incase the group already exists in SQLite, we don't want to overwrite.
        insertGroupsSQL = `INSERT OR IGNORE INTO groups (id, obj) VALUES `;
        insertGroupsSQL += messages
          .map((m) => {
            // TODO: Insert the actual group object, and change to INSERT OR REPLACE
            insertGroupsArgs.push(m.group_identifier, "{}");
            return "(?,?)";
          })
          .join(",");
      }

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
   * Fetch those groups which aren't already saved in the DB.
   * @param _requiredGroupIds
   * @param trpcUtils
   * @returns
   */
  fetchUnseenGroupsInfo(
    _requiredGroupIds: string[],
    trpcUtils: ReturnType<typeof trpc.useContext>
  ): Promise<Record<string, Group | null>> {
    const requiredGroupIds = _.uniq(_requiredGroupIds);

    return new Promise((resolve, reject) => {
      this.db.exec(
        [
          {
            sql: `SELECT id FROM groups WHERE id IN (${requiredGroupIds
              .map(() => "?")
              .join(",")})`,
            args: requiredGroupIds,
          },
        ],
        true,
        async (err, resultSet) => {
          if (err) {
            reject(err);
          } else if (resultSet && resultSet.length > 0) {
            // @ts-ignore
            if (!resultSet[0].error) {
              const result = resultSet[0] as ResultSet;

              const unsavedGroupIds = requiredGroupIds.filter((identifier) => {
                return result.rows.some((g) => g.id === identifier);
              });

              // Now fetch the groups
              try {
                const queryResults = await allSettled(
                  unsavedGroupIds.map((identifier) =>
                    trpcUtils.client.school.messaging.fetchGroupInfo.query({
                      groupIdentifier: identifier,
                    })
                  )
                );

                // Generate final result
                const finalMap: Awaited<
                  ReturnType<typeof this.fetchUnseenGroupsInfo>
                > = {};

                queryResults.map((result, i) => {
                  const groupId = unsavedGroupIds[i];
                  if (result.status === "fulfilled") {
                    finalMap[groupId] = result.value;
                  } else {
                    finalMap[groupId] = null;
                  }
                });

                resolve(finalMap);
              } catch (error) {
                console.error("trpc fetch group error", error);
                reject(error);
              }
            }
          }
        }
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
  const [, setIsLoaded] = useState(false);

  useEffect(() => {
    if (socket && !messages.current) {
      messages.current = new MessagesRepository(db, socket);
      setIsLoaded(true);
    }
  }, [socket]);

  if (!messages.current) return null;

  return createElement(MessagesRepositoryContext.Provider, {
    value: messages.current,
    children,
  });
}

export function useMessages() {
  const messages = useContext(MessagesRepositoryContext);
  return messages!;
}
