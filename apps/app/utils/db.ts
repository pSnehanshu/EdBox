import * as SQLite from "expo-sqlite";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { migrations as allMigrations } from "./db-migration";

const dbContext = createContext<SQLite.WebSQLDatabase | null>(null);

interface DBProviderProps {
  children: JSX.Element | JSX.Element[];
}
/**
 * Provide SQLite DB connection to children
 */
export function DBProvider({ children }: DBProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const db = useRef<SQLite.WebSQLDatabase>();

  useEffect(() => {
    if (isOpen) return;

    SQLite.openDatabase("main", "", "The main DB", 0, (_db) => {
      db.current = _db;
      migrate(_db);
      setIsOpen(true);
    });
  }, [isOpen, setIsOpen]);

  if (!isOpen || !db.current) return null;

  return createElement(
    dbContext.Provider,
    {
      value: db.current,
    },
    children,
  );
}

/**
 * Get the WebSQLDatabase instance
 */
export function useDB() {
  const db = useContext(dbContext);
  return db!;
}

/**
 * Pass a SELECT SQL query to read data from SQLite
 * @param sql
 * @param args
 * @returns
 */
export function useReadDB<T = unknown>(
  sql: string,
  args: Array<number | string | null> = [],
) {
  const db = useDB();
  const [result, setResult] = useState<T[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SQLite.SQLError>();

  useEffect(() => {
    setIsLoading(true);

    db.readTransaction(
      (tx) => {
        tx.executeSql(
          sql,
          args,
          (tx, res) => {
            setResult(res.rows._array);
          },
          (tx, err) => {
            setError(err);
            return true;
          },
        );
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );

    return () => {
      setError(undefined);
    };
  }, [sql, args.join("/")]);

  return {
    data: result,
    isLoading,
    isError: !!error,
    error,
  };
}

export type Migration = {
  name: string;
  fn: (tx: SQLite.SQLTransaction, db: SQLite.WebSQLDatabase) => Promise<void>;
};

/**
 * Start the migration process
 * @param db
 */
function migrate(db: SQLite.WebSQLDatabase) {
  let pendingMigrations: Migration[] = [];
  let lastMigrationSNO = -1;

  db.transaction(
    (tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS _st_migrations (
          sno INTEGER NOT NULL,
          name TEXT NOT NULL PRIMARY KEY,
          ran_at TEXT NOT NULL DEFAULT CURRENT_TIMSTAMP
        )`,
      );

      // Fetch migrations
      tx.executeSql(
        "SELECT * FROM _st_migrations ORDER BY sno DESC LIMIT 1",
        [],
        (tx, result) => {
          const lastMigration = result.rows.item(0);
          lastMigrationSNO = lastMigration
            ? parseInt(lastMigration.sno, 10)
            : -1;

          // Slice out the pending migrations
          pendingMigrations = allMigrations.slice(lastMigrationSNO + 1);

          console.log(
            `To apply ${pendingMigrations.length} migrations`,
            pendingMigrations.map((m) => m.name),
          );
        },
        () => {
          return true;
        },
      );
    },
    (err) => console.error(err),
    () => {
      executeMigrations(db, pendingMigrations, lastMigrationSNO + 1)
        .then(() => {
          console.log("All migrations applied!");
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to apply migrations!");
        });
    },
  );
}

/**
 * Run the given migrations and mark them as ran
 * @param db
 * @param migrations
 * @param migrationStartIndex
 * @returns
 */
export function executeMigrations(
  db: SQLite.WebSQLDatabase,
  migrations: Migration[],
  migrationStartIndex: number,
) {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        migrations.forEach((migration, i) => {
          migration.fn(tx, db);

          // Mark as ran
          const sno = i + migrationStartIndex;
          const row = [sno, migration.name, new Date().toISOString()];
          tx.executeSql(
            "INSERT INTO _st_migrations (sno, name, ran_at) VALUES (?,?,?)",
            row,
          );
          console.log("Migration ran", row);
        });
      },
      reject,
      () => resolve(undefined),
    );
  });
}
