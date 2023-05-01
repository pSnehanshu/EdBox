import express, { Response } from "express";
import bodyParser from "body-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import parseDataUrl from "parse-data-url";
import fs from "fs";
import { appRouter as trpcRouter } from "../trpc";
import { createContext } from "../trpc/context";
import prisma from "../prisma";
import path from "path";
import expoUpdates from "../expo-updates";

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

// Updates
app.use("/updates", expoUpdates);

const defaultSchoolIcon = fs.readFileSync(
  path.join(__dirname, "..", "assets", "school-default-icon.png"),
);

function sendDefaultIcon(res: Response) {
  res.setHeader("Content-Type", "image/png");
  res.send(defaultSchoolIcon);
}

// Other routes
app.get("/school-info/:schoolId/:type", async (req, res) => {
  try {
    const { schoolId } = req.params;
    const type = req.params.type as "icon" | "logo";

    if (!["icon", "logo"].includes(type)) {
      return res.sendStatus(404);
    }

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

export default app;
