import { getTheme, setTheme } from "@/lib/storage";
import type { ThemeMode } from "@/types";
import { useCallback, useEffect, useState } from "react";

/**
 * テーマをDOMに適用する
 */
function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;

  if (theme === "system") {
    // OS設定に従う
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.removeAttribute("data-theme");
    root.classList.toggle("dark", prefersDark);
    return;
  }

  if (theme === "dark") {
    root.removeAttribute("data-theme");
    root.classList.add("dark");
    return;
  }

  // dracula, one-dark などのカスタムテーマ
  root.setAttribute("data-theme", theme);
  root.classList.add("dark");
}

interface UseThemeReturn {
  theme: ThemeMode;
  changeTheme: (theme: ThemeMode) => void;
}

/**
 * テーマ管理のカスタムフック
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>(() => getTheme());

  // テーマ適用
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const changeTheme = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme); // storage保存
    setThemeState(newTheme);
  }, []);

  return { theme, changeTheme };
}
