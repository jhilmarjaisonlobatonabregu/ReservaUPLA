import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'reservaupla.theme.v1';

function obtenerTemaInicial(): ThemeMode {
  try {
    const guardado = localStorage.getItem(THEME_STORAGE_KEY);
    if (guardado === 'dark' || guardado === 'light') {
      return guardado;
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const inicial = obtenerTemaInicial();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', inicial === 'dark');
    }
    return inicial;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignorar si localStorage está restringido
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme
  };
}
