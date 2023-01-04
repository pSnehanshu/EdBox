import * as SQLite from "expo-sqlite";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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
      setIsOpen(true);
    });
  }, [isOpen, setIsOpen]);

  if (!isOpen || !db.current) return null;

  return <dbContext.Provider value={db.current}>{children}</dbContext.Provider>;
}

/**
 * Get the WebSQLDatabase instance
 */
export function useDB() {
  const db = useContext(dbContext);
  return db!;
}

/**
 * Util functions for Expo SQLite
 */

/**
 * Executes SQL inside a transaction
 * @param tx
 * @param sql
 * @param args
 * @returns
 */
export function executeSql(
  tx: SQLite.SQLTransaction,
  sql: string,
  args: Array<string | number | null>
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    tx.executeSql(
      sql,
      args,
      (_, res) => resolve(res),
      (_, err) => {
        reject(err);
        return true;
      }
    );
  });
}

/**
 * Initiate a DB transaction
 * @param db
 * @param executor
 * @returns
 */
export function transaction(
  db: SQLite.WebSQLDatabase,
  executor: SQLite.SQLTransactionCallback
) {
  return new Promise((resolve, reject) => {
    db.transaction(executor, reject, () => resolve(undefined));
  });
}
