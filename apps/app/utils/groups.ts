import { useEffect, useMemo } from "react";
import type { Group } from "schooltalk-shared/types";
import { useDB, useReadDB } from "./db";
import { trpc } from "./trpc";

/**
 * Fetch info about one single group. It will first fetch from SQLite, then from server.
 * @param groupIdentifier
 */
export function useGroupInfo(groupIdentifier: string) {
  const db = useDB();
  const dbResult = useReadDB<{ id: string; obj: string }>(
    "SELECT * FROM groups WHERE id = ?",
    [groupIdentifier]
  );
  const groupQuery = trpc.school.messaging.fetchGroupInfo.useQuery({
    groupIdentifier,
  });

  useEffect(() => {
    if (groupQuery.isFetched) {
      // Update in DB
      db.transaction((tx) => {
        tx.executeSql("INSERT OR REPLACE INTO groups (id, obj) VALUES (?,?)", [
          groupIdentifier,
          JSON.stringify(groupQuery.data),
        ]);
      }, console.error);
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
