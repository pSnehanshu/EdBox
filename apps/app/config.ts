/**
 * This file is the global config file. Import this to access the values.
 * This will throw error if it is unable to gather all the required configs.
 */

import { z } from "zod";

const ConfigSchema = z.object({
  backendHost: z.string().url(),
  schoolId: z.string().cuid(),
});

export default ConfigSchema.parse({
  backendHost: process.env.HOSTNAME,
  schoolId: process.env.SCHOOLID,
});
