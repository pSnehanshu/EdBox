import { ResultSet, WebSQLDatabase } from "expo-sqlite";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Group, RouterInput } from "schooltalk-shared/types";
import { useDB, useReadDB } from "./db";
import { trpc } from "./trpc";

type FetchGroupsInput = RouterInput["school"]["messaging"]["fetchGroups"];

/**
 * Fetch info about one single group. It will first fetch from SQLite, then from server.
 * @param groupIdentifier
 */
export function useGroupInfo(groupIdentifier: string) {
  const db = useDB();
  const dbResult = useReadDB<{ id: string; obj: string }>(
    "SELECT * FROM groups WHERE id = ?",
    [groupIdentifier],
  );
  const groupQuery = trpc.school.messaging.fetchGroupInfo.useQuery({
    groupIdentifier,
  });

  useEffect(() => {
    if (groupQuery.isFetched && groupQuery.data) {
      // Update in DB
      insertGroups(db, [groupQuery.data]).catch(console.error);
    }
  }, [groupQuery.isFetched]);

  const dbData = useMemo(() => {
    return dbResult.data?.[0]
      ? (JSON.parse(dbResult.data?.[0].obj) as Group)
      : undefined;
  }, [dbResult.data?.[0]?.id]);

  const data = groupQuery.data ?? dbData;

  return {
    data,
    isLoading: !data && (dbResult.isLoading || groupQuery.isLoading),
    isError: !data && (dbResult.isError || groupQuery.isError),
    error: { db: dbResult.error, server: groupQuery.error },
  };
}

/**
 * Hook for fetching groups from SQLite and Server combined
 */
export function useGetUserGroups(input: FetchGroupsInput) {
  const db = useDB();
  const utils = trpc.useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const appendGroups = useCallback(
    (newGroups: Group[]) => {
      setGroups((existingGroups) => {
        return _.uniqBy(existingGroups.concat(newGroups), (g) => g.identifier);
      });
    },
    [setGroups],
  );

  const fetchGroups = useCallback(
    async (data: FetchGroupsInput, clear = true) => {
      try {
        setIsLoading(true);

        if (clear) setGroups([]);

        // 1. Fetch from SQLite, and return
        const dbGroups = await fetchUserGroupsFromSQLite(db);

        // 2. Return the values
        appendGroups(dbGroups);

        // 3. Fetch from server
        const serverGroups =
          await utils.client.school.messaging.fetchGroups.query(data);

        // 4. Clear existing groups
        await clearGroups(db);

        // 5. Return these values
        appendGroups(serverGroups);

        // 6. Save the groups
        await insertGroups(db, serverGroups);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    },
    [appendGroups],
  );

  const refetch = useCallback(
    (clear?: boolean) => fetchGroups(input, clear),
    [fetchGroups],
  );

  useEffect(() => {
    fetchGroups(input, false);
  }, [input.limit, input.page, fetchGroups]);

  return {
    isLoading,
    groups,
    refetch,
  };
}

/**
 * Fetch groups from SQLite
 * @param db WebSQLDatabase
 */
export async function fetchUserGroupsFromSQLite(db: WebSQLDatabase) {
  return new Promise<Group[]>((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        "SELECT * FROM groups",
        [],
        (tx, result) => {
          const groupResults = result.rows._array as {
            id: string;
            obj: string;
          }[];

          const groups = groupResults
            .map((g) => {
              const parsed = JSON.parse(g.obj);
              if (Object.keys(parsed).length > 0) {
                return parsed as Group;
              } else {
                return null;
              }
            })
            .filter((g) => g !== null /* Remove null values */);
          resolve(groups as Group[]);
        },
        (tx, err) => {
          reject(err);
          return true;
        },
      );
    });
  });
}

/**
 * Fetch those groups which aren't already saved in the DB.
 * @param db WebSQLDatabase
 * @param groupIds Return info of those groups among these IDs, whose data is not present in SQLite
 * @param trpcUtils The output of `trpc.useContext()`
 */
export async function fetchUnseenGroupsInfo(
  db: WebSQLDatabase,
  groupIds: string[],
  trpcUtils: ReturnType<typeof trpc.useContext>,
): Promise<Record<string, Group>> {
  const _groupIds = _.uniq(groupIds);

  return new Promise((resolve, reject) => {
    db.exec(
      [
        {
          sql: `SELECT id FROM groups WHERE id IN (${_groupIds
            .map(() => "?")
            .join(",")})`,
          args: _groupIds,
        },
      ],
      true,
      async (err, resultSet) => {
        if (err) {
          reject(err);
        } else if (resultSet && resultSet.length > 0) {
          // @ts-expect-error It is the problem of the typings of `WebSQLDatabase` that `error` is not defined
          if (!resultSet[0].error) {
            const result = resultSet[0] as ResultSet;

            const unsavedGroupIds = _groupIds.filter((identifier) => {
              return !result.rows.some((g) => g.id === identifier);
            });

            // Now fetch the groups
            try {
              const queryResults = await Promise.allSettled(
                unsavedGroupIds.map((identifier) =>
                  trpcUtils.client.school.messaging.fetchGroupInfo.query({
                    groupIdentifier: identifier,
                  }),
                ),
              );

              // Generate final result
              const finalMap: Awaited<
                ReturnType<typeof fetchUnseenGroupsInfo>
              > = {};

              queryResults.map((result, i) => {
                const groupId = unsavedGroupIds[i];
                if (result.status === "fulfilled") {
                  finalMap[groupId] = result.value;
                }
              });

              resolve(finalMap);
            } catch (error) {
              console.error("trpc fetch group error", error);
              reject(error);
            }
          }
        }
      },
    );
  });
}

/**
 * Insert the given groups in SQLite
 * @param db WebSQLDatabase
 * @param groups
 */
export async function insertGroups(db: WebSQLDatabase, groups: Group[]) {
  if (groups.length < 1) return;

  const args: Array<string | number> = [];
  const sql = `INSERT OR REPLACE INTO groups (id, obj) VALUES ${groups
    .map((group) => {
      args.push(group.identifier, JSON.stringify(group));
      return "(?,?)";
    })
    .join(",")}`;

  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(sql, args);
      },
      reject,
      resolve,
    );
  });
}

async function clearGroups(db: WebSQLDatabase) {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("DELETE FROM groups");
      },
      reject,
      resolve,
    );
  });
}
