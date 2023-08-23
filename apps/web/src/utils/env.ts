import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BACKEND_URL: z.union([z.string().url(), z.string().startsWith("/")]),
  },
  runtimeEnvStrict: {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  },
});
