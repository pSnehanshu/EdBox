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
import { SocketClient } from "../utils/types/common";
import { useSocket } from "./socketio";
import { trpc } from "./trpc";
import _ from "lodash";
import Toast from "react-native-toast-message";
import type { IGroupActivity } from "schooltalk-shared/types";
import type { FilePermissionsInput } from "schooltalk-shared/misc";
import { parseISO } from "date-fns";

export class MessagesRepository {
  /** The observable representing all received messages */
  readonly Activity$ = new Subject<IGroupActivity>();

  /** Group wise observables */
  readonly groupMessagesObservableMap = new Map<
    string,
    Subject<IGroupActivity>
  >();

  readonly Composer$ = new Subject<{
    groupIdentifier: string;
    text: string;
    files?: FilePermissionsInput[];
  }>();

  constructor(private socket: SocketClient) {
    this.socket.on("newActivity", (activity) => {
      this.Activity$.next(activity);
    });

    // Forward group messages to group observers
    this.Activity$.subscribe((activity) => {
      const groupObservable = this.groupMessagesObservableMap.get(
        activity.group_id,
      );
      if (groupObservable) {
        groupObservable.next(activity);
      }
    });

    // When new message is created
    this.Composer$.subscribe((activity) => {
      // TODO: Send via tRPC
    });

    // Show message alert
    this.Activity$.subscribe((activity) => {
      // TODO: Show group and author info
      if (
        activity.type === "message_new" &&
        activity.payload.t === "message_new"
      ) {
        Toast.show({
          type: "info",
          text1: `Message from ${activity.author_id}`,
          text2: activity.payload.body,
          onPress() {
            // navigationRef.navigate("ChatWindow", {
            //   identifier: activity.group_id,
            //   name: "",
            // });

            Toast.hide();
          },
        });
      }
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
    // const groupObservable = new Subject<Message>();
    // this.groupMessagesObservableMap.set(groupIdentifier, groupObservable);

    // return groupObservable;
  }

  useGroupActivityReceived(
    groupIdentifier: string,
    onReceive: (activity: IGroupActivity) => void,
  ) {
    useEffect(() => {
      const observable = this.getGroupMessageObservable(groupIdentifier);
      const subscription = observable?.subscribe((message) => {
        onReceive(message);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }, [groupIdentifier]);
  }

  useFetchGroupMessages(groupId: string, limit = 20) {
    const utils = trpc.useContext();
    const [finalActivites, setFinalActivities] = useState<IGroupActivity[]>([]);
    const [nextCursor, setNextCursor] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const setActivitiesReconcile = useCallback(
      (activites: IGroupActivity[], cursor?: string) => {
        setNextCursor(cursor);

        setFinalActivities((existingActivities) => {
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
          return _.chain(activites.concat(existingActivities))
            .sortBy((act) => parseISO(act.created_at))
            .sortedUniqBy((act) => act.id)
            .reverse()
            .value();
        });
      },
      [],
    );

    const fetchActivities = useCallback(
      async (cursor?: string) => {
        try {
          // Start loading
          setIsLoading(true);

          const serverPromise =
            utils.client.school.messaging.fetchGroupActivities.query({
              groupId,
              limit,
              cursor,
            });

          // 1. Fetch from local
          // const dbMessages = await this.fetchMessagesFromDB({
          //   groupIdentifier: groupId,
          //   limit,
          //   cursor,
          // });

          // // 2. Return local data
          // // setMessagesReconcile(dbMessages.messages, dbMessages.cursor);

          // // 3. Fetch from Server
          const serverActivities = await serverPromise;

          // // 4. Save server data into local
          // // await this.insertMessagesToDB(serverMessages.messages, utils);

          // // 5. Re-fetch from local
          // const dbMessages2 = await this.fetchMessagesFromDB({
          //   groupIdentifier: groupId,
          //   limit,
          //   cursor,
          // });

          // 6. Return fresh local data
          setActivitiesReconcile(
            serverActivities.data,
            serverActivities.nextCursor,
          );
        } catch (error) {
          console.error("fetchMessages Error:", error);
        } finally {
          // Loading finish
          setIsLoading(false);
        }
      },
      [groupId, limit, setActivitiesReconcile],
    );

    const fetchNextPage = useCallback(() => {
      if (nextCursor && !isLoading) {
        fetchActivities(nextCursor);
      }
    }, [fetchActivities, nextCursor, isLoading]);

    useEffect(() => {
      fetchActivities(nextCursor);
    }, [fetchActivities]);

    useEffect(() => {
      setFinalActivities([]);
      setNextCursor(undefined);
      fetchActivities();
    }, [groupId]);

    this.useGroupActivityReceived(groupId, (activity) => {
      setFinalActivities((m) => [activity].concat(m));
    });

    return {
      messages: finalActivites,
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
  }) {
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
  }

  /**
   * Insert messages (and groups) to SQLite.
   * @param messages
   */
  async insertMessagesToDB(
    messages: null[],
    trpcUtils: ReturnType<typeof trpc.useContext>,
  ): Promise<void> {
    if (messages.length < 1) return;

    try {
      // Fetch all unseen groups, groups that don't exist in the local SQLite
      // const groupsToInsert = await fetchUnseenGroupsInfo(
      //   this.db,
      //   messages
      //     .map((m) => /* m.group_identifier ?? */ "")
      //     .filter((iden) => !!iden) as string[],
      //   trpcUtils,
      // );
      // Insert those groups
    } catch (error) {
      console.error("Failed to fetch or save unseen groups", error);
    }

    const insertMessagesArgs: Array<string | number | null> = [];
    // const insertMessagesSQL = `INSERT OR REPLACE INTO messages (id, obj, created_at, group_identifier, sort_key) VALUES ${messages
    //   .map((m) => {
    //     insertMessagesArgs.push(
    //       // These props will probably never be undefined, but this ?? is here
    //       // for safety and/or to satisfy TypeScript.
    //       m.id ?? Math.random().toString(),
    //       JSON.stringify(m),
    //       m.created_at ?? new Date().toISOString(),
    //       m.group_identifier ?? "",
    //       m.sort_key ?? Math.round(Math.random()),
    //     );
    //     return "(?,?,?,?,?)";
    //   })
    //   .join(",")}`;
  }

  /**
   * Send a new message
   * @param groupIdentifier
   * @param text
   */
  sendMessage(
    groupIdentifier: string,
    text: string,
    files?: FilePermissionsInput[],
  ) {
    this.Composer$.next({
      groupIdentifier,
      text,
      files,
    });
  }
}

const MessagesRepositoryContext = createContext<MessagesRepository | null>(
  null,
);

interface MessagesProviderProp {
  children: React.ReactNode;
}
export function MessagesProvider({ children }: MessagesProviderProp) {
  const socket = useSocket();
  const messages = useRef<MessagesRepository>();

  useEffect(() => {
    if (socket && !messages.current) {
      messages.current = new MessagesRepository(socket);
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
