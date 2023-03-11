import express from "express";
import { z } from "zod";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import mime from "mime";

/** The S3 client */
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: "ap-south-1",
});

/** Express Router */
const app = express.Router();

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   next();
// });

// Necessary types
type Asset = {
  hash?: string;
  key: string;
  contentType: string;
  fileExtension?: string;
  url: string;
};

type Manifest = {
  id: string;
  createdAt: string;
  runtimeVersion: string;
  launchAsset: Asset;
  assets: Asset[];
  metadata: { [key: string]: string };
  extra: { [key: string]: any };
};

// Necessary schemas
const MetadataAssetSchema = z.object({
  path: z.string(),
  ext: z.string(),
});

const PlatformMetadataSchema = z.object({
  bundle: z.string(),
  assets: MetadataAssetSchema.array(),
});

/** Inspired by https://github.com/expo/expo-cli/blob/670e3c89c9ad6afb8a803140fce30b3ecf8091e0/packages/expo-cli/src/commands/export/createMetadataJson.ts#L13 */
const MetadataSchema = z.object({
  version: z.literal(0),
  bundler: z.literal("metro"),
  fileMetadata: z.object({
    android: PlatformMetadataSchema.optional(),
    ios: PlatformMetadataSchema.optional(),
  }),
});

const manifestHeaderSchema = z.object({
  "expo-protocol-version": z.enum(["0", "1"]).default("0"),
  "expo-platform": z.enum(["ios", "android"]),
  "expo-runtime-version": z.string(),
});

/**
 * Generate Asset Object of a given asset
 * @param asset
 * @param basePath
 */
async function getAssetMetadata(
  asset: z.infer<typeof MetadataAssetSchema>,
  basePath: string
): Promise<Asset> {
  const path = `${basePath}/${asset.path}`;
  const assetHash = await getAssetFileHashAndKey(path);

  if (!assetHash) {
    throw new Error(`Failed to generate hash of ${path}`);
  }

  const contentType = mime.getType(asset.ext);
  if (!contentType) {
    throw new Error(`Failed to get mime type of ${path} (ext: ${asset.ext})`);
  }

  return {
    contentType,
    key: assetHash.key,
    hash: assetHash.hash,
    fileExtension: asset.ext,
    url: `https://schooltalk-expo-update-assets.s3.ap-south-1.amazonaws.com/${path}`,
  };
}

/**
 * Generate file's hash (sha256) and key (md5) as per https://github.dev/expo/custom-expo-updates-server/blob/8d3d71edd4cb809c8bff02ffb889d74806b83530/expo-updates-server/common/helpers.ts#L81
 * @param s3key The key of the file in S3
 */
async function getAssetFileHashAndKey(
  s3key: string
): Promise<{ hash: string; key: string } | null> {
  const fileResponse = await s3.send(
    new GetObjectCommand({
      Bucket: "schooltalk-expo-update-assets",
      Key: s3key,
    })
  );

  if (!fileResponse.Body) {
    return null;
  }

  const fileArray = await fileResponse.Body.transformToByteArray();

  const hash = crypto
    .createHash("sha256")
    .update(fileArray)
    .digest("base64url");

  const key = crypto.createHash("md5").update(fileArray).digest("hex");

  return { hash, key };
}

// The /manifest endpoint
app.get<string, {}, Manifest>("/manifest", async (req, res) => {
  // Ensure proper headers are set
  const parsedHeaders = manifestHeaderSchema.safeParse(req.headers);
  if (!parsedHeaders.success) {
    return res.sendStatus(400);
  }
  const headers = parsedHeaders.data;

  /** The path of the metadata.json file */
  const metadataFileKey = `updates/${headers["expo-runtime-version"]}/metadata.json`;

  /** Fetch the metadata.json file from S3 */
  const metadataFileResponse = await s3
    .send(
      new GetObjectCommand({
        Bucket: "schooltalk-expo-update-assets",
        Key: metadataFileKey,
      })
    )
    .catch((err: unknown) => {
      console.error(err);
    });

  // If it doesn't exist, throw
  if (!metadataFileResponse?.Body) {
    console.error(`Can't find metadata.json file ${metadataFileKey}`);
    return res.sendStatus(404);
  }

  /** metadata.json as string */
  const metadataFile = await metadataFileResponse.Body.transformToString(
    "utf-8"
  );

  /** The parsed file, ensure it is of correct format */
  const parsedMetadataFile = MetadataSchema.safeParse(JSON.parse(metadataFile));
  if (!parsedMetadataFile.success) {
    console.error(`Malformed metadata.json file ${metadataFileKey}`);
    return res.sendStatus(404);
  }
  /** Validated and parsed metadata.json file */
  const { data: metadata } = parsedMetadataFile;

  /** Check if the update has updates for the client's platform */
  const platformMetadata = metadata.fileMetadata[headers["expo-platform"]];
  if (!platformMetadata) {
    console.error(
      `No updates for ${headers["expo-platform"]} in file ${metadataFileKey}`
    );
    return res.sendStatus(404);
  }

  /** Unique ID of the update based on the hash of the metadata.json file */
  const updateId = crypto
    .createHash("sha256")
    .update(metadataFile)
    .digest("hex");

  // Update is available, return the manifest json
  res.setHeader("expo-protocol-version", 0);
  res.setHeader("expo-sfv-version", 0);
  res.setHeader("cache-control", "cache-control: private, max-age=0");

  /** Generate the Assets objects, with hash and keys */
  let assets: Asset[] = [];
  try {
    assets = await Promise.all(
      platformMetadata.assets.map((asset) =>
        getAssetMetadata(asset, `updates/${headers["expo-runtime-version"]}`)
      )
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

  /** Generate hash and keys of the main JS file */
  const bundleFileKey = `updates/${headers["expo-runtime-version"]}/${platformMetadata.bundle}`;
  const bundleHash = await getAssetFileHashAndKey(bundleFileKey);

  if (!bundleHash) {
    console.error(`Failed to generate hash of ${bundleFileKey}`);
    return res.sendStatus(500);
  }

  // Finally, return the manifest
  res.json({
    id: updateId,
    createdAt: new Date().toISOString(),
    metadata: {},
    assets,
    launchAsset: {
      contentType: "application/javascript",
      key: bundleHash.key,
      url: `https://schooltalk-expo-update-assets.s3.ap-south-1.amazonaws.com/updates/${headers["expo-runtime-version"]}/${platformMetadata.bundle}`,
      fileExtension: ".bundle",
      hash: bundleHash.hash,
    },
    extra: {},
    runtimeVersion: headers["expo-runtime-version"],
  });
});

export default app;
