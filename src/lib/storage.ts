import type { HistoryEntry, ThemeMode } from "@/types";

const HISTORY_KEY = "mkn_history";
const SIDEBAR_STATE_KEY = "mkn_sidebar_state";
const THEME_KEY = "mkn_theme";
const MAX_HISTORY_ENTRIES = 10;

/**
 * 履歴を取得
 */
export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as HistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * 履歴に追加
 */
export function addToHistory(path: string): HistoryEntry[] {
  const history = getHistory();

  // 既存のエントリを削除
  const filtered = history.filter((entry) => entry.path !== path);

  // 新しいエントリを先頭に追加
  const newEntry: HistoryEntry = {
    path,
    accessedAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ENTRIES);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * 履歴から削除
 */
export function removeFromHistory(path: string): HistoryEntry[] {
  const history = getHistory();
  const filtered = history.filter((entry) => entry.path !== path);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  return filtered;
}

/**
 * サイドバーの開閉状態を取得
 */
export function getSidebarState(): boolean {
  try {
    const data = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (data === null) {
      return true; // デフォルトは開いた状態
    }
    return JSON.parse(data) as boolean;
  } catch {
    return true;
  }
}

/**
 * サイドバーの開閉状態を保存
 */
export function setSidebarState(isOpen: boolean): void {
  localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isOpen));
}

/**
 * テーマモードを取得
 */
export function getTheme(): ThemeMode {
  try {
    const data = localStorage.getItem(THEME_KEY);
    if (!data) {
      return "dracula"; // デフォルトはDracula
    }
    return JSON.parse(data) as ThemeMode;
  } catch {
    return "dracula";
  }
}

/**
 * テーマモードを保存
 */
export function setTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}
