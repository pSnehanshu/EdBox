import express from "express";
import bodyParser from "body-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter as trpcRouter } from "../trpc";
import { createContext } from "../trpc/context";

const app = express();
app.use(bodyParser.json());

app.set("trust proxy", true);

// tRPC
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: trpcRouter,
    createContext,
  }),
);

export default app;
