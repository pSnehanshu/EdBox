import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  return { session: null };
}

export type Context = inferAsyncReturnType<typeof createContext>;
