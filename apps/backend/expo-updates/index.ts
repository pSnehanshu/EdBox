import express from "express";
import { z } from "zod";

const app = express.Router();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

type Manifest = {
  id: string;
  createdAt: string;
  runtimeVersion: string;
  launchAsset: Asset;
  assets: Asset[];
  metadata: { [key: string]: string };
  extra: { [key: string]: any };
};

type Asset = {
  hash?: string;
  key: string;
  contentType: string;
  fileExtension?: string;
  url: string;
};

const manifestHeaderSchema = z.object({
  "expo-protocol-version": z.enum(["0", "1"]).default("0"),
  "expo-platform": z.enum(["ios", "android"]),
  "expo-runtime-version": z.string(),
});

const assetsHeaderSchema = z.object({});

app.get<string, {}, Manifest>("/manifest", async (req, res) => {
  const parsedHeaders = manifestHeaderSchema.safeParse(req.headers);
  if (!parsedHeaders.success) {
    return res.sendStatus(400);
  }

  const headers = parsedHeaders.data;

  res.setHeader("expo-protocol-version", 0);
  res.setHeader("expo-sfv-version", 0);

  res.setHeader("cache-control", "cache-control: private, max-age=0");
});

app.get("/assets", async (req, res) => {
  //
});

export default app;
