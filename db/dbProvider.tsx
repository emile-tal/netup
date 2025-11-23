import React, { createContext, useContext, useMemo } from 'react';

import { Database } from '@nozbe/watermelondb';
import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { makeDatabase } from './makeDatabase';

const DBContext = createContext<Database | null>(null);

export function DBRootProvider({ children }: { children: React.ReactNode }) {
  const db = useMemo(() => makeDatabase(), []);
  return (
    <DatabaseProvider database={db}>
      <DBContext.Provider value={db}>{children}</DBContext.Provider>
    </DatabaseProvider>
  );
}

export function useDB(): Database {
  const db = useContext(DBContext);
  if (!db) throw new Error('useDB used outside DBRootProvider');
  return db;
}
