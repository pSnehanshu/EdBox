import { useState, useEffect } from "react";
import type { TrpcReactType } from "../../apps/app/utils/trpc";
import { User } from "./types";

type LoggedIn = {
  isLoggedIn: true;
  user: User;
  isLoading: boolean;
};

type NotLoggedIn = {
  isLoggedIn: false;
  user: null;
  isLoading: boolean;
};

type CurrentUserProps = {
  trpc: TrpcReactType;
  getAuthToken(): Promise<string | null>;
  getStoredUser: () => Promise<string | null>;
  removeStoredUser: () => Promise<void>;
  setStoredUser: (user?: User) => Promise<void>;
};

export function GenerateCurrentUserHook({
  trpc,
  getAuthToken,
  getStoredUser,
  removeStoredUser,
  setStoredUser,
}: CurrentUserProps) {
  /**
   * Cache user object to avoid fetching from AsyncStorage over and over
   */
  let globalUser: User | null = null;

  return (): LoggedIn | NotLoggedIn => {
    const [user, setUser] = useState<User | null>(globalUser);
    const [isLoading, setIsLoading] = useState(true);

    const me = trpc.profile.me.useQuery(undefined, {
      retry: false,
      staleTime: 60 * 60 * 1000,
    });

    useEffect(() => {
      (async () => {
        // Cached value found, no need to refetch
        if (globalUser) return;

        const token = await getAuthToken();
        if (!token) return;

        // Token is set, try to fetch the user object
        const _user = await getStoredUser();
        if (!_user) return;

        const user = JSON.parse(_user);
        setUser(user);

        // Cache the value
        globalUser = user;
      })().finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
      (async () => {
        if (!me.isFetching) {
          if (me.isError) {
            const error = me.error;
            if (error.data?.code === "UNAUTHORIZED") {
              // Session is invalid
              setUser(null);
              await removeStoredUser();
              globalUser = null;
            }
          } else {
            // Save locally
            setUser(me.data ?? null);
            await setStoredUser(me.data);
            globalUser = me.data ?? null;
          }
        }
      })().finally(() => setIsLoading(false));
    }, [me.isFetching]);

    const isLoggedIn = !!user;

    if (isLoggedIn) {
      return { isLoggedIn, user, isLoading };
    }

    return { isLoggedIn, user: null, isLoading };
  };
}
