import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter as trpcRouter } from "./trpc";
import { createContext } from "./trpc/context";
import initSocketIo from "./socketio";

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

const port = parseInt(process.env.PORT ?? "5080", 10);
const httpServer = app.listen(port, () =>
  console.log(`Running on port ${port}`),
);

initSocketIo(httpServer);
