import prisma from "../prisma";
import { publicProcedure, router } from "./trpc";
import authRouter from "./routers/auth";
import schoolRouter from "./routers/school";

export const appRouter = router({
  auth: authRouter,
  school: schoolRouter,
  health: publicProcedure.query(async ({ input, ctx }) => {
    // Test DB connection
    const result = await prisma.$queryRaw`select 1+1 sum`;

    return {
      time: new Date(), // Current server time
      db: result,
    };
  }),
});

export type AppRouter = typeof appRouter;