import { SHORTCUTS, type ShortcutKey, matchesShortcut } from "@/lib/shortcuts";
import { useCallback, useEffect } from "react";

/**
 * ショートカットキーを登録するカスタムフック
 * @param shortcutKey ショートカットキー名
 * @param handler ショートカット実行時のハンドラ
 * @param enabled ショートカットを有効にするか（デフォルト: true）
 */
export function useShortcut(shortcutKey: ShortcutKey, handler: () => void, enabled = true): void {
  const shortcut = SHORTCUTS[shortcutKey];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        handler();
      }
    },
    [shortcut, handler, enabled]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * 複数のショートカットを一度に登録するカスタムフック
 * @param shortcuts ショートカットキーとハンドラのマップ（undefined可）
 * @param enabled ショートカットを有効にするか（デフォルト: true）
 */
export function useShortcuts(
  shortcuts: Partial<Record<ShortcutKey, (() => void) | undefined>>,
  enabled = true
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      for (const [key, handler] of Object.entries(shortcuts)) {
        const shortcut = SHORTCUTS[key as ShortcutKey];
        if (handler && matchesShortcut(event, shortcut)) {
          event.preventDefault();
          handler();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}
