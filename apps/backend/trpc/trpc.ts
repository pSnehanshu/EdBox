import { initTRPC, TRPCError } from "@trpc/server";
import { hasUserStaticRoles, StaticRole } from "schooltalk-shared/misc";
import { Permissions } from "schooltalk-shared/permissions.enum";
import { userHasPermissions } from "../utils/permissions";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;

const authMiddleware = t.middleware(({ ctx, next }) => {
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

export const protectedProcedure = procedure.use(authMiddleware);

/** Verify that the user is a teacher */
export const teacherMiddleware = authMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (!ctx.session.User.Teacher) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not a teacher",
      });
    }

    return next({
      ctx: {
        ...ctx,
        teacher: ctx.session.User.Teacher,
      },
    });
  },
);

/** Verify that the user is a student */
export const studentMiddleware = authMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (!ctx.session.User.Student) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not a student",
      });
    }

    return next({
      ctx: {
        ...ctx,
        student: ctx.session.User.Student,
      },
    });
  },
);

export const principalMiddleware = authMiddleware.unstable_pipe(
  ({ ctx, next }) => {
    if (
      !hasUserStaticRoles(
        ctx.user,
        [StaticRole.principal, StaticRole.vice_principal],
        "some",
      ) ||
      !ctx.session.User.Staff
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not principal",
      });
    }

    return next({
      ctx: {
        ...ctx,
        principal: ctx.session.User.Staff,
      },
    });
  },
);

export const roleMiddleware = (
  allowedRoles: StaticRole[],
  mode: "all" | "some" = "some",
) =>
  authMiddleware.unstable_pipe(({ ctx, next }) => {
    if (!hasUserStaticRoles(ctx.user, allowedRoles, mode)) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    return next({ ctx });
  });

export const dynamicRoleMiddleware = (
  permissions: Permissions[],
  mode: "all" | "some",
) =>
  authMiddleware.unstable_pipe(async ({ ctx, next }) => {
    const hasPermission = await userHasPermissions(
      ctx.user.id,
      permissions,
      mode,
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User does not have enough permissions",
      });
    }

    return next({ ctx });
  });
