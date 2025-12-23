import {
  addToHistory,
  getHistory,
  getSidebarState,
  getTheme,
  setSidebarState,
  setTheme,
} from "@/lib/storage";
import {
  openDirectoryDialog,
  readFileContent,
  scanDirectory,
} from "@/lib/tauri";
import { generateToc } from "@/lib/toc";
import type { AppState, ThemeMode } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseAppReturn extends AppState {
  openDirectory: () => Promise<void>;
  openDirectoryFromPath: (path: string) => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  toggleSidebar: () => void;
  handleFileDrop: (paths: string[]) => Promise<void>;
  changeTheme: (theme: ThemeMode) => void;
}

const initialState: AppState = {
  currentDirectory: null,
  selectedFile: null,
  fileTree: [],
  markdownContent: "",
  isSidebarOpen: true,
  toc: [],
  history: [],
  isLoading: false,
  error: null,
  theme: "dracula",
};

export function useApp(): UseAppReturn {
  const [state, setState] = useState<AppState>(() => ({
    ...initialState,
    isSidebarOpen: getSidebarState(),
    history: getHistory(),
    theme: getTheme(),
  }));

  // テーマ適用
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = state.theme;

    if (currentTheme === "system") {
      // OS設定に従う
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.removeAttribute("data-theme");
      root.classList.toggle("dark", prefersDark);
    } else if (currentTheme === "dark") {
      root.removeAttribute("data-theme");
      root.classList.add("dark");
    } else if (currentTheme === "dracula") {
      root.setAttribute("data-theme", "dracula");
      root.classList.add("dark");
    } else if (currentTheme === "one-dark") {
      root.setAttribute("data-theme", "one-dark");
      root.classList.add("dark");
    }
  }, [state.theme]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B でサイドバーのトグル
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const openDirectoryFromPath = useCallback(
    async (path: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const fileTree = await scanDirectory(path);
        const history = addToHistory(path);

        updateState({
          currentDirectory: path,
          fileTree,
          history,
          selectedFile: null,
          markdownContent: "",
          toc: [],
          isLoading: false,
        });
      } catch (error) {
        updateState({
          isLoading: false,
          error: String(error),
        });
      }
    },
    [updateState]
  );

  const openDirectory = useCallback(async () => {
    try {
      const path = await openDirectoryDialog();
      if (path) {
        await openDirectoryFromPath(path);
      }
    } catch (error) {
      updateState({ error: String(error) });
    }
  }, [openDirectoryFromPath, updateState]);

  const selectFile = useCallback(
    async (path: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const content = await readFileContent(path);
        const toc = generateToc(content);

        updateState({
          selectedFile: path,
          markdownContent: content,
          toc,
          isLoading: false,
        });
      } catch (error) {
        updateState({
          isLoading: false,
          error: String(error),
        });
      }
    },
    [updateState]
  );

  const toggleSidebar = useCallback(() => {
    setState((prev) => {
      const newState = !prev.isSidebarOpen;
      setSidebarState(newState);
      return { ...prev, isSidebarOpen: newState };
    });
  }, []);

  const handleFileDrop = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) {
        return;
      }

      const firstPath = paths[0];
      if (!firstPath) {
        return;
      }

      // .md または .mdc ファイルの場合
      if (firstPath.endsWith(".md") || firstPath.endsWith(".mdc")) {
        await selectFile(firstPath);
      } else {
        // ディレクトリの場合
        await openDirectoryFromPath(firstPath);
      }
    },
    [openDirectoryFromPath, selectFile]
  );

  const changeTheme = useCallback(
    (theme: ThemeMode) => {
      setTheme(theme);
      updateState({ theme });
    },
    [updateState]
  );

  return {
    ...state,
    openDirectory,
    openDirectoryFromPath,
    selectFile,
    toggleSidebar,
    handleFileDrop,
    changeTheme,
  };
}
