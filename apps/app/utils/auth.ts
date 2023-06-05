import { isPast, isValid, parseISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import type { User } from "schooltalk-shared/types";
import { StaticRole } from "schooltalk-shared/misc";
import { trpc } from "./trpc";
import { AUTH_TOKEN, AUTH_TOKEN_EXPIRY, USER } from "./async-storage-keys";
import { useDB } from "./db";
import { getPushToken } from "./push-notifications";
import { useConfigUpdate } from "./config";

/**
 * Get the current token
 */
export async function getAuthToken() {
  const expiry = await SecureStore.getItemAsync(AUTH_TOKEN_EXPIRY).catch(
    (err) => {
      console.error(err);
      return null;
    },
  );
  if (!expiry) return null;

  const expiryDate = parseISO(expiry);
  if (!isValid(expiryDate)) return null;

  // Expired tokens are invalid
  if (isPast(expiryDate)) return null;

  return SecureStore.getItemAsync(AUTH_TOKEN).catch((err) => {
    console.error(err);
    return null;
  });
}

export async function setAuthToken(token: string, expiry: Date): Promise<void> {
  if (!isValid(expiry)) {
    throw new Error("Cannot set invalid token expiry date");
  }
  if (isPast(expiry)) {
    throw new Error("Cannot set an expired auth token");
  }
  await SecureStore.setItemAsync(AUTH_TOKEN, token);
  await SecureStore.setItemAsync(AUTH_TOKEN_EXPIRY, expiry.toISOString());
}

/**
 * This hook returns a setter function, which also invalidates the login status
 */
export function useSetAuthToken() {
  const utils = trpc.useContext();

  return useCallback(async (token: string, expiry: Date) => {
    await setAuthToken(token, expiry);
    utils.profile.me.invalidate();
  }, []);
}

export function useLogout() {
  const utils = trpc.useContext();
  const setConfig = useConfigUpdate();
  const db = useDB();

  const logoutMutation = trpc.auth.logout.useMutation({
    async onSuccess() {
      Toast.show({
        type: "success",
        text1: "You have been logged out",
        position: "top",
      });

      // Unset previously selected role
      setConfig({ activeStaticRole: StaticRole.none });

      // Clear token
      await SecureStore.deleteItemAsync(AUTH_TOKEN);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_EXPIRY);
      await SecureStore.deleteItemAsync(USER);

      await utils.profile.me.invalidate();

      // Clear all SQLite data
      db.transaction(
        (tx) => {
          tx.executeSql("DELETE FROM messages");
          tx.executeSql("DELETE FROM groups");
        },
        (error) => {
          console.error("Failed to delete all SQLite data", error);
        },
        () => {
          console.log("Deleted all SQLite data!");
        },
      );
    },
    onError() {
      Toast.show({
        type: "error",
        text1: "Failed to logout",
        text2: "Please try again later",
        position: "top",
      });
    },
  });

  return useCallback(
    async () =>
      logoutMutation.mutate({
        // Submit token to get it removed if possible
        pushToken: await getPushToken()
          .then((token) => ({
            token,
            type: "expo" as const,
          }))
          .catch((err) => {
            console.error(err);
            return undefined;
          }),
      }),
    [],
  );
}

/**
 * Cache user object to avoid fetching from AsyncStorage over and over
 */
let globalUser: User | null = null;

type LoggedIn = {
  isLoggedIn: true;
  user: User;
};

type NotLoggedIn = {
  isLoggedIn: false;
  user: null;
};

export function useCurrentUser(): LoggedIn | NotLoggedIn {
  const [user, setUser] = useState<User | null>(globalUser);
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
      const _user = await AsyncStorage.getItem(USER);
      if (!_user) return;

      const user = JSON.parse(_user);
      setUser(user);

      // Cache the value
      globalUser = user;
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!me.isFetching) {
        if (me.isError) {
          const error = me.error;
          if (error.data?.code === "UNAUTHORIZED") {
            // Session is invalid
            setUser(null);
            await AsyncStorage.removeItem(USER);
            globalUser = null;
          }
        } else {
          // Save locally
          setUser(me.data ?? null);
          await AsyncStorage.setItem(USER, JSON.stringify(me.data));
          globalUser = me.data ?? null;
        }
      }
    })();
  }, [me.isFetching]);

  const isLoggedIn = !!user;

  if (isLoggedIn) {
    return {
      isLoggedIn,
      user,
    };
  }

  return {
    isLoggedIn,
    user: null,
  };
}
