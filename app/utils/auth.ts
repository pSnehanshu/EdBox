import { isPast, isValid, parseISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import { trpc } from "./trpc";

const AUTH_TOKEN = "auth-token";
const AUTH_TOKEN_EXPIRY = "auth-token-expiry";

export function useAuthToken() {
  const utils = trpc.useContext();

  return {
    async set(token: string, expiry: Date) {
      if (!isValid(expiry)) {
        throw new Error("Cannot set invalid token expiry date");
      }
      if (isPast(expiry)) {
        throw new Error("Cannot set an expired auth token");
      }
      await SecureStore.setItemAsync(AUTH_TOKEN, token);
      await SecureStore.setItemAsync(AUTH_TOKEN_EXPIRY, expiry.toISOString());
      utils.auth.whoami.invalidate();
    },
    async get() {
      const expiry = await SecureStore.getItemAsync(AUTH_TOKEN_EXPIRY);
      if (!expiry) return null;

      const expiryDate = parseISO(expiry);
      if (!isValid(expiryDate)) return null;

      // Expired tokens are invalid
      if (isPast(expiryDate)) return null;

      return SecureStore.getItemAsync(AUTH_TOKEN);
    },
  };
}

export function useFetchCurrentUser() {
  const { isLoading, isError, data } = trpc.auth.whoami.useQuery(undefined, {
    retry: false,
  });

  return {
    isLoading,
    isLoggedIn: !(isLoading || isError),
    user: data,
  };
}

/**
 * Get the currently logged in user.
 * Use this function only when you're sure that the user is logged in.
 */
export function useCurrentUser() {
  const { user } = useFetchCurrentUser();
  return user as NonNullable<typeof user>;
}
