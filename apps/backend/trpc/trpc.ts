import { initTRPC, TRPCError } from "@trpc/server";
import { getUserRole, StaticRole } from "schooltalk-shared/misc";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const authMiddleware = t.middleware(({ ctx, next }) => {
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
});

/** Verify that the user is a teacher */
export const teacherMiddleware = authMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (getUserRole(ctx.session.User) !== StaticRole.teacher) {
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
  }
);

/** Verify that the user is a student */
export const studentMiddleware = authMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (getUserRole(ctx.session.User) !== StaticRole.student) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not a student",
      });
    }

    return next({
      ctx: {
        ...ctx,
        student: ctx.session.User.Student!,
      },
    });
  }
);

export const principalMiddleware = authMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    const role = getUserRole(ctx.session.User);

    if (
      !(role === StaticRole.principal || role === StaticRole.vice_principal)
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not principal",
      });
    }

    return next({
      ctx: {
        ...ctx,
        principal: ctx.session.User.Staff!,
      },
    });
  }
);

export const roleMiddleware = (allowedRoles: StaticRole[]) =>
  authMiddleware.unstable_pipe(({ ctx, next }) => {
    const role = getUserRole(ctx.session.User);

    if (!allowedRoles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    return next({ ctx });
  });
