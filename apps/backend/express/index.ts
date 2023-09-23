import express, { Response } from "express";
import bodyParser from "body-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import parseDataUrl from "parse-data-url";
import fs from "fs";
import path from "path";
import cors from "cors";
import { appRouter as trpcRouter } from "../trpc";
import { createContext } from "../trpc/context";
import prisma from "../prisma";
import config from "../config";

const app = express();
export default app;

app.set("trust proxy", true);

// Serve the API
app.use("/api", defineBackend());

// Serve the static frontend
const FE_ARTIFACT_DIR = path.join(__dirname, "..", "..", "web", "dist");
app.use(express.static(FE_ARTIFACT_DIR, { maxAge: "1y", immutable: true }));
app.get("*", (_req, res) =>
  res.sendFile(path.join(FE_ARTIFACT_DIR, "index.html")),
);

function defineBackend() {
  const router = express.Router();

  router.use(bodyParser.json());

  // Intentional latency for dev
  if (config.NODE_ENV === "development") {
    console.log(
      `Requests are artificially delayed by ${config.ARTIFICIAL_LATENCY} ms. Configure using ARTIFICIAL_LATENCY env var.`,
    );
    router.use((_req, _res, next) =>
      setTimeout(next, config.ARTIFICIAL_LATENCY),
    );

    // Allow all cors in dev
    router.use(cors());
  }

  // tRPC
  router.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext,
    }),
  );

  const defaultSchoolIcon = fs.readFileSync(
    path.join(__dirname, "..", "assets", "school-default-icon.png"),
  );

  function sendDefaultIcon(res: Response) {
    res.setHeader("Content-Type", "image/png");
    res.send(defaultSchoolIcon);
  }

  // Other routes
  router.get("/school-info/:schoolId/:type", async (req, res) => {
    try {
      const { schoolId } = req.params;
      const type = req.params.type as "icon" | "logo";

      if (!["icon", "logo"].includes(type)) {
        return res.sendStatus(404);
      }

      // Set a cache-period of 1 day
      res.setHeader("Cache-Control", "public, max-age=86400");

      if (!schoolId) {
        return sendDefaultIcon(res);
      }

      // Fetch school
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { is_active: true, icon: true, logo: true },
      });

      // Make sure school exists and is active
      if (!school || !school.is_active) {
        return sendDefaultIcon(res);
      }

      // Extract the img
      const img = school[type] ?? school[type === "icon" ? "logo" : "icon"];

      if (!img) {
        return sendDefaultIcon(res);
      }

      // If base64 image
      if (img.startsWith("data:image/")) {
        const parsedIcon = parseDataUrl(img);
        if (!parsedIcon) {
          return sendDefaultIcon(res);
        }
        const buffer = parsedIcon.toBuffer();
        res.setHeader("Content-Type", parsedIcon.contentType);
        res.send(buffer);
      } else if (img.startsWith("http://") || img.startsWith("https://")) {
        // If URL
        res.redirect(img);
      } else {
        // Bad!
        sendDefaultIcon(res);
      }
    } catch (error) {
      sendDefaultIcon(res);
      console.error(error);
    }
  });

  return router;
}
