import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import schema from "./schema";
import migrations from "./migrations";
import Group from "./Group";

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error("Error setting up wDB", error);
    // Database failed to load -- offer the user to reload the app or log out
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Group],
});
