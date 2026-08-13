'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminTheme = 'black' | 'white';

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>('black');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('hnf_admin_theme') as AdminTheme;
      if (savedTheme === 'white' || savedTheme === 'black') {
        setThemeState(savedTheme);
      }
    } catch (e) {
      console.warn('Failed to load admin theme:', e);
    }
  }, []);

  const setTheme = (newTheme: AdminTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('hnf_admin_theme', newTheme);
    } catch (e) {
      console.warn('Failed to save admin theme:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'black' ? 'white' : 'black');
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      theme: 'black' as AdminTheme,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};
