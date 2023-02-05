import { initTRPC, TRPCError } from "@trpc/server";
import { getUserRole, StaticRole } from "schooltalk-shared/misc";
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
});

/** Verify that the user is a student */
export const studentMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not logged in",
    });
  }

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
});

/** Procedure with `teacherMiddleware` pre-applied */
export const teacherProcedure = authProcedure.use(teacherMiddleware);

/** Procedure with `studentMiddleware` pre-applied */
export const studentProcedure = authProcedure.use(studentMiddleware);

export const principalMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not logged in",
    });
  }

  const role = getUserRole(ctx.session.User);

  if (!(role === StaticRole.principal || role === StaticRole.vice_principal)) {
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
});

export const principalProcedure = authProcedure.use(principalMiddleware);

export const roleMiddleware = (allowedRoles: StaticRole[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not logged in",
      });
    }

    const role = getUserRole(ctx.session.User);

    if (!allowedRoles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    return next({ ctx });
  });
