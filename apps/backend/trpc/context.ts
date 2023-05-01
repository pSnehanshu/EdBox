import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { isPast } from "date-fns";
import prisma from "../prisma";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const sessionId = req.headers["x-session-id"];

  // Session ID not submitted
  if (typeof sessionId !== "string") {
    return { session: null };
  }

  // Find the session
  const session = await prisma.loginSession.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      User: {
        include: {
          School: true,
          Student: true,
          Teacher: true,
          Parent: true,
          Staff: true,
        },
      },
    },
  });

  // Session doesn't exists
  if (!session) {
    return { session: null };
  }

  // Session has expired
  if (isPast(session.expiry_date)) {
    // Delete the expired session
    await prisma.loginSession.delete({
      where: {
        id: sessionId,
      },
    });

    return { session: null };
  }

  // User is active, but school inactive, session invalid
  if (!session.User.School.is_active) {
    return { session: null };
  }

  // Session exists
  return { session };
}

export type Context = inferAsyncReturnType<typeof createContext>;
