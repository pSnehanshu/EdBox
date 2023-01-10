import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const authProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not logged in!",
      });
    }

    return next({
      ctx: {
        session: ctx.session,
        user: ctx.session.User,
      },
    });
  })
);
