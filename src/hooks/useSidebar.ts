import { getSidebarState, setSidebarState } from "@/lib/storage";
import { useCallback, useEffect, useState } from "react";

interface UseSidebarReturn {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
}

/**
 * サイドバーの開閉状態を管理するカスタムフック
 */
export function useSidebar(): UseSidebarReturn {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => getSidebarState());

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      setSidebarState(newState);
      return newState;
    });
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    setSidebarState(true);
  }, []);

  // キーボードショートカット: Cmd/Ctrl + B でサイドバーのトグル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return { isSidebarOpen, toggleSidebar, openSidebar };
}
