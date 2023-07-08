import prisma from "../prisma";
import { publicProcedure, router } from "./trpc";
import authRouter from "./routers/auth";
import schoolRouter from "./routers/school";
import profileRouter from "./routers/profile";

export const appRouter = router({
  auth: authRouter,
  school: schoolRouter,
  profile: profileRouter,
  health: publicProcedure.query(async () => {
    // Test DB connection
    const result = await prisma.$queryRaw`select 1+1 sum`;

    return {
      time: new Date(), // Current server time
      db: result,
    };
  }),
});

export type AppRouter = typeof appRouter;
