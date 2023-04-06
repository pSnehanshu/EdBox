import express from "express";
import bodyParser from "body-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import parseDataUrl from "parse-data-url";
import { appRouter as trpcRouter } from "../trpc";
import { createContext } from "../trpc/context";
import prisma from "../prisma";

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

// Other routes
app.get("/school-info/:schoolId/:type", async (req, res) => {
  try {
    const { schoolId } = req.params;
    const type = req.params.type as "icon" | "logo";

    if (!["icon", "logo"].includes(type)) {
      return res.sendStatus(404);
    }

    if (!schoolId) {
      return res.sendStatus(404);
    }

    // Fetch school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { is_active: true, icon: true, logo: true },
    });

    // Make sure school exists and is active
    if (!school || !school.is_active) {
      return res.sendStatus(404);
    }

    // Extract the img
    const img = school[type] ?? school[type === "icon" ? "logo" : "icon"];

    if (!img) {
      return res.sendStatus(404);
    }

    // If base64 image
    if (img.startsWith("data:image/")) {
      const parsedIcon = parseDataUrl(img);
      if (!parsedIcon) {
        return res.sendStatus(500);
      }
      const buffer = parsedIcon.toBuffer();
      res.setHeader("Content-Type", parsedIcon.contentType);
      res.send(buffer);
    } else if (img.startsWith("http://") || img.startsWith("https://")) {
      // If URL
      res.redirect(img);
    } else {
      // Bad!
      res.sendStatus(500);
    }
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

export default app;
