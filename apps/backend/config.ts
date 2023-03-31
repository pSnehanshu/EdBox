import { z } from "zod";

const ConfigSchema = z.object({
  OTP_LENGTH: z.number().int().default(6),
  S3_UPLOAD_URL_EXPIRY_SECONDS: z
    .number()
    .int()
    .default(30 * 60),
  S3_USERCONTENT_BUCKET: z.string(),
  NODE_ENV: z
    .enum(["production", "development", "staging"])
    .default("development"),
});

export default ConfigSchema.parse(process.env);
