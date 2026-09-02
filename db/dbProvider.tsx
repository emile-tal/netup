import React, { createContext, useContext, useMemo } from 'react';

import { Database } from '@nozbe/watermelondb';
import { makeDatabase } from './makeDatabase';

const DBContext = createContext<Database | null>(null);

interface DBRootProviderProps {
  /**
   * The signed-in user's id. Each account gets its own local database file, so two
   * accounts on one device never share a store — RLS protects the server, but nothing
   * would protect the device without this.
   *
   * `null` while signed out: no database is opened, and `useDB()` throws if something
   * tries to read one. The root layout's route guards keep that from happening.
   */
  userId: string | null;
  children: React.ReactNode;
}

export function DBRootProvider({ userId, children }: DBRootProviderProps) {
  const db = useMemo(() => (userId ? makeDatabase(`app-${userId}.db`) : null), [userId]);
  return <DBContext.Provider value={db}>{children}</DBContext.Provider>;
}

export function useDB(): Database {
  const db = useContext(DBContext);
  if (!db) throw new Error('useDB used outside DBRootProvider, or while signed out');
  return db;
}
