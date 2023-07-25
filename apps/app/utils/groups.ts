import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import type { RouterInput, Group } from "schooltalk-shared/types";
import { trpc } from "./trpc";

type FetchGroupsInput = RouterInput["school"]["messaging"]["fetchGroups"];

/**
 * Fetch info about one single group. It will first fetch from SQLite, then from server.
 * @param groupIdentifier
 */
export function useGroupInfo(groupIdentifier: string) {
  // const groupQuery = trpc.school.messaging.fetchGroupInfo.useQuery({
  //   groupIdentifier,
  // });

  // useEffect(() => {
  //   if (groupQuery.isFetched && groupQuery.data) {
  //     // Update in DB
  //     insertGroups(db, [groupQuery.data]).catch(console.error);
  //   }
  // }, [groupQuery.isFetched]);

  // const data = groupQuery.data ?? dbData;

  return {
    data: null,
    isLoading: false, // !data && (dbResult.isLoading || groupQuery.isLoading),
    isError: false, //  !data && (dbResult.isError || groupQuery.isError),
    error: { db: null, server: "groupQuery.error" },
  };
}

/**
 * Hook for fetching groups from SQLite and Server combined
 */
export function useGetUserGroups(input: FetchGroupsInput) {
  const utils = trpc.useContext();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const appendGroups = useCallback(
    (newGroups: Group[]) => {
      setGroups((existingGroups) => {
        return _.uniqBy(existingGroups.concat(newGroups), (g) => g.id);
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
        // const dbGroups = await fetchUserGroupsFromSQLite(db);

        // 2. Return the values
        // appendGroups(dbGroups);

        // 3. Fetch from server
        const serverGroups =
          await utils.client.school.messaging.fetchGroups.query(data);

        // 4. Clear existing groups
        // await clearGroups(db);

        // 5. Return these values
        appendGroups(serverGroups);

        // 6. Save the groups
        // await insertGroups(db, serverGroups);
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
