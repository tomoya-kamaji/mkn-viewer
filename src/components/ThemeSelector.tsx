import type { ThemeMode } from "@/types";
import { useState } from "react";

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const themes: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "system", label: "システム", icon: "💻" },
  { value: "dark", label: "ダーク", icon: "🌙" },
  { value: "dracula", label: "Dracula", icon: "🧛" },
  { value: "one-dark", label: "One Dark", icon: "🌑" },
];

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // themes配列は固定なのでデフォルト値を直接指定
  const defaultTheme = { value: "dracula" as ThemeMode, label: "Dracula", icon: "🧛" };
  const currentThemeData = themes.find((t) => t.value === currentTheme) ?? defaultTheme;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors"
        title="テーマを変更"
      >
        <span className="text-base">{currentThemeData?.icon ?? "🌑"}</span>
      </button>

      {isOpen && (
        <>
          {/* オーバーレイ */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: オーバーレイはクリックのみで閉じる */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* ドロップダウンメニュー */}
          <div className="absolute right-0 top-full mt-1 w-40 bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg shadow-lg z-20">
            {themes.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => {
                  onThemeChange(theme.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                  transition-colors
                  ${
                    currentTheme === theme.value
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100"
                      : "hover:bg-surface-200 dark:hover:bg-surface-800"
                  }
                `}
              >
                <span>{theme.icon}</span>
                <span>{theme.label}</span>
                {currentTheme === theme.value && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
