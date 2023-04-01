import { z } from "zod";

const ConfigSchema = z.object({
  OTP_LENGTH: z.number().int().default(6),
  S3_UPLOAD_URL_EXPIRY_SECONDS: z
    .number()
    .int()
    .default(30 * 60),
  S3_DOWNLOAD_URL_EXPIRY_SECONDS: z
    .number()
    .int()
    .default(5 * 60),
  S3_USERCONTENT_BUCKET: z.string(),
  NODE_ENV: z
    .enum(["production", "development", "staging"])
    .default("development"),
  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string().default("ap-south-1"),
});

export default ConfigSchema.parse(process.env);
