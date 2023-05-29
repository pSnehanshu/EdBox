import prisma from "../prisma";
import { t } from "./trpc";
import authRouter from "./routers/auth";
import schoolRouter from "./routers/school";

export const appRouter = t.router({
  auth: authRouter,
  school: schoolRouter,
  health: t.procedure.query(async () => {
    // Test DB connection
    const result = await prisma.$queryRaw`select 1+1 sum`;

    return {
      time: new Date(), // Current server time
      db: result,
    };
  }),
});

export type AppRouter = typeof appRouter;
