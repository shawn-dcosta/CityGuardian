import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    // Permanently enforce light mode globally
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Return static false for dark mode, and a dummy toggle so we don't break existing prop types in other components
  return { isDarkMode: false, toggleTheme: () => {} };
};
