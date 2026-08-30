import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminMe } from '../api/client.js';

const AdminContext = createContext({ isAdmin: false, checked: false, setIsAdmin: () => {} });

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    adminMe()
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecked(true));
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, checked, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
