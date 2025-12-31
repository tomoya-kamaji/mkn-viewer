import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useTheme } from "./useTheme";

// storage関数をモック
vi.mock("@/lib/storage", () => ({
  getTheme: vi.fn(),
  setTheme: vi.fn(),
}));

import { getTheme, setTheme } from "@/lib/storage";

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // DOMをクリーンアップ
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
  });

  describe("初期状態", () => {
    test("localStorageのテーマ値で初期化される", () => {
      // Arrange
      vi.mocked(getTheme).mockReturnValue("dracula");

      // Act
      const { result } = renderHook(() => useTheme());

      // Assert
      expect(result.current.theme).toBe("dracula");
    });
  });

  describe("changeTheme", () => {
    test("テーマを変更するとstateとlocalStorageが更新される", () => {
      // Arrange
      vi.mocked(getTheme).mockReturnValue("dracula");
      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current.changeTheme("one-dark");
      });

      // Assert
      expect(result.current.theme).toBe("one-dark");
      expect(setTheme).toHaveBeenCalledWith("one-dark");
    });

    test("darkテーマに変更するとDOMにdarkクラスが追加される", () => {
      // Arrange
      vi.mocked(getTheme).mockReturnValue("dracula");
      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current.changeTheme("dark");
      });

      // Assert
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    });

    test("カスタムテーマに変更するとdata-theme属性が設定される", () => {
      // Arrange
      vi.mocked(getTheme).mockReturnValue("dark");
      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current.changeTheme("dracula");
      });

      // Assert
      expect(document.documentElement.getAttribute("data-theme")).toBe("dracula");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("systemテーマ", () => {
    test("systemテーマでダークモード設定の場合はdarkクラスが追加される", () => {
      // Arrange
      vi.mocked(getTheme).mockReturnValue("dracula");
      // matchMediaをダークモードに設定
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current.changeTheme("system");
      });

      // Assert
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    });

    test("systemテーマでライトモード設定の場合はdarkクラスが削除される", () => {
      // Arrange
      vi.mocked(getTheme).mockReturnValue("dark");
      // matchMediaをライトモードに設定
      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      const { result } = renderHook(() => useTheme());

      // Act
      act(() => {
        result.current.changeTheme("system");
      });

      // Assert
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });
});
