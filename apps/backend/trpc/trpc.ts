import { initTRPC, TRPCError } from "@trpc/server";
import { getUserRole } from "schooltalk-shared/misc";
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

/** Verify that the user is a teacher */
export const teacherMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not logged in",
    });
  }

  if (getUserRole(ctx.session.User) !== "teacher") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not a teacher",
    });
  }

  return next({
    ctx: {
      ...ctx,
      teacher: ctx.session.User.Teacher!,
    },
  });
});

/** Procedure with `teacherMiddleware` pre-applied */
export const teacherProcedure = authProcedure.use(teacherMiddleware);
