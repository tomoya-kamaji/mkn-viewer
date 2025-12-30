/**
 * ショートカットキーの定義
 */
export interface ShortcutDefinition {
  /** キー（小文字） */
  key: string;
  /** Cmd/Ctrl キーが必要か */
  meta?: boolean;
  /** Shift キーが必要か */
  shift?: boolean;
  /** 説明 */
  description: string;
}

/**
 * アプリケーション全体のショートカット定義
 */
export const SHORTCUTS = {
  /** サイドバーの開閉 */
  toggleSidebar: {
    key: "b",
    meta: true,
    description: "サイドバーの開閉",
  },
  /** グローバル検索にフォーカス */
  focusSearch: {
    key: "f",
    meta: true,
    shift: true,
    description: "検索にフォーカス",
  },
  /** ページ内検索 */
  pageSearch: {
    key: "f",
    meta: true,
    description: "ページ内検索",
  },
  /** ページ内検索を閉じる */
  closePageSearch: {
    key: "Escape",
    description: "ページ内検索を閉じる",
  },
  /** 次の検索結果 */
  nextSearchResult: {
    key: "Enter",
    description: "次の検索結果",
  },
  /** 前の検索結果 */
  prevSearchResult: {
    key: "Enter",
    shift: true,
    description: "前の検索結果",
  },
} as const satisfies Record<string, ShortcutDefinition>;

export type ShortcutKey = keyof typeof SHORTCUTS;

/**
 * KeyboardEventがショートカットにマッチするか判定
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
  const metaMatch = shortcut.meta ? event.metaKey || event.ctrlKey : true;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

  return metaMatch && shiftMatch && keyMatch;
}
