import { S3Client } from "@aws-sdk/client-s3";
import ImageKit from "imagekit";
import config from "../config";

export const s3client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

export const imagekit = new ImageKit({
  publicKey: config.IK_PUBLIC_KEY,
  privateKey: config.IK_PRIVATE_KEY,
  urlEndpoint:
    config.NODE_ENV === "production"
      ? "https://ik.imagekit.io/indorhino/edbox"
      : "https://ik.imagekit.io/indorhino/edbox-dev",
});
