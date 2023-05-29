import { z } from "zod";

const StringNumber = z
  .string()
  .regex(/^\d+$/)
  .transform((v) => parseInt(v, 10));

const ConfigSchema = z.object({
  OTP_LENGTH: StringNumber.default("6"),
  S3_UPLOAD_URL_EXPIRY_SECONDS: StringNumber.default((30 * 60).toString()),
  S3_DOWNLOAD_URL_EXPIRY_SECONDS: StringNumber.default((5 * 60).toString()),
  S3_USERCONTENT_BUCKET: z.string(),
  NODE_ENV: z
    .enum(["production", "development", "staging"])
    .default("development"),
  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string().default("ap-south-1"),
  IK_PUBLIC_KEY: z.string(),
  IK_PRIVATE_KEY: z.string(),
  ARTIFICIAL_LATENCY: StringNumber.default("3000"),
});

export default ConfigSchema.parse(process.env);
