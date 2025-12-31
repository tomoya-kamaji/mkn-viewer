import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useSidebar } from "./useSidebar";

// storage関数をモック
vi.mock("@/lib/storage", () => ({
  getSidebarState: vi.fn(),
  setSidebarState: vi.fn(),
}));

// useShortcutをモック（副作用を無効化）
vi.mock("./useShortcut", () => ({
  useShortcut: vi.fn(),
}));

import { getSidebarState, setSidebarState } from "@/lib/storage";

describe("useSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初期状態", () => {
    test("localStorageの値がtrueの場合、サイドバーは開いた状態で初期化される", () => {
      // Arrange
      vi.mocked(getSidebarState).mockReturnValue(true);

      // Act
      const { result } = renderHook(() => useSidebar());

      // Assert
      expect(result.current.isSidebarOpen).toBe(true);
    });

    test("localStorageの値がfalseの場合、サイドバーは閉じた状態で初期化される", () => {
      // Arrange
      vi.mocked(getSidebarState).mockReturnValue(false);

      // Act
      const { result } = renderHook(() => useSidebar());

      // Assert
      expect(result.current.isSidebarOpen).toBe(false);
    });
  });

  describe("toggleSidebar", () => {
    test("開いた状態から閉じた状態に切り替わる", () => {
      // Arrange
      vi.mocked(getSidebarState).mockReturnValue(true);
      const { result } = renderHook(() => useSidebar());

      // Act
      act(() => {
        result.current.toggleSidebar();
      });

      // Assert
      expect(result.current.isSidebarOpen).toBe(false);
      expect(setSidebarState).toHaveBeenCalledWith(false);
    });

    test("閉じた状態から開いた状態に切り替わる", () => {
      // Arrange
      vi.mocked(getSidebarState).mockReturnValue(false);
      const { result } = renderHook(() => useSidebar());

      // Act
      act(() => {
        result.current.toggleSidebar();
      });

      // Assert
      expect(result.current.isSidebarOpen).toBe(true);
      expect(setSidebarState).toHaveBeenCalledWith(true);
    });
  });

  describe("openSidebar", () => {
    test("閉じた状態から開いた状態になる", () => {
      // Arrange
      vi.mocked(getSidebarState).mockReturnValue(false);
      const { result } = renderHook(() => useSidebar());

      // Act
      act(() => {
        result.current.openSidebar();
      });

      // Assert
      expect(result.current.isSidebarOpen).toBe(true);
      expect(setSidebarState).toHaveBeenCalledWith(true);
    });

    test("既に開いた状態でも開いた状態のままになる", () => {
      // Arrange
      vi.mocked(getSidebarState).mockReturnValue(true);
      const { result } = renderHook(() => useSidebar());

      // Act
      act(() => {
        result.current.openSidebar();
      });

      // Assert
      expect(result.current.isSidebarOpen).toBe(true);
      expect(setSidebarState).toHaveBeenCalledWith(true);
    });
  });
});
