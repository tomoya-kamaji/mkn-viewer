import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useShortcut, useShortcuts } from "./useShortcut";

describe("useShortcut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ショートカットキーの検出", () => {
    test("Cmd+BでtoggleSidebarハンドラが呼ばれる", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("toggleSidebar", handler));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test("Ctrl+BでもtoggleSidebarハンドラが呼ばれる（Windows対応）", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("toggleSidebar", handler));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "b",
        ctrlKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test("Cmd+Shift+FでfocusSearchハンドラが呼ばれる", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("focusSearch", handler));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "f",
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("enabled引数", () => {
    test("enabled=falseの場合はハンドラが呼ばれない", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("toggleSidebar", handler, false));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });

    test("enabled=trueの場合はハンドラが呼ばれる", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("toggleSidebar", handler, true));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("不一致のキー入力", () => {
    test("異なるキーが押された場合はハンドラが呼ばれない", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("toggleSidebar", handler));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "a",
        metaKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });

    test("修飾キーなしで押された場合はハンドラが呼ばれない", () => {
      // Arrange
      const handler = vi.fn();
      renderHook(() => useShortcut("toggleSidebar", handler));

      // Act
      const event = new KeyboardEvent("keydown", {
        key: "b",
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Assert
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("クリーンアップ", () => {
    test("アンマウント時にイベントリスナーが削除される", () => {
      // Arrange
      const handler = vi.fn();
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() => useShortcut("toggleSidebar", handler));

      // Act
      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });
  });
});

describe("useShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("複数のショートカットを同時に登録できる", () => {
    // Arrange
    const toggleHandler = vi.fn();
    const searchHandler = vi.fn();
    renderHook(() =>
      useShortcuts({
        toggleSidebar: toggleHandler,
        focusSearch: searchHandler,
      })
    );

    // Act - toggleSidebar
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
      })
    );

    // Assert
    expect(toggleHandler).toHaveBeenCalledTimes(1);
    expect(searchHandler).not.toHaveBeenCalled();

    // Act - focusSearch
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "f",
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );

    // Assert
    expect(searchHandler).toHaveBeenCalledTimes(1);
  });

  test("undefinedのハンドラは無視される", () => {
    // Arrange
    const toggleHandler = vi.fn();
    renderHook(() =>
      useShortcuts({
        toggleSidebar: toggleHandler,
        focusSearch: undefined,
      })
    );

    // Act
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "f",
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );

    // Assert - エラーなく動作すること
    expect(toggleHandler).not.toHaveBeenCalled();
  });

  test("enabled=falseの場合は全てのハンドラが呼ばれない", () => {
    // Arrange
    const toggleHandler = vi.fn();
    const searchHandler = vi.fn();
    renderHook(() =>
      useShortcuts(
        {
          toggleSidebar: toggleHandler,
          focusSearch: searchHandler,
        },
        false
      )
    );

    // Act
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "b",
        metaKey: true,
        bubbles: true,
      })
    );

    // Assert
    expect(toggleHandler).not.toHaveBeenCalled();
    expect(searchHandler).not.toHaveBeenCalled();
  });
});
