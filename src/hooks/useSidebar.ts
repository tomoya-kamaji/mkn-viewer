import { getSidebarState, setSidebarState } from "@/lib/storage";
import { useCallback, useState } from "react";
import { useShortcut } from "./useShortcut";

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
  useShortcut("toggleSidebar", toggleSidebar);

  return { isSidebarOpen, toggleSidebar, openSidebar };
}
