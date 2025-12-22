import {
  addToHistory,
  getHistory,
  getSidebarState,
  setSidebarState,
} from "@/lib/storage";
import {
  openDirectoryDialog,
  readFileContent,
  scanDirectory,
} from "@/lib/tauri";
import { generateToc } from "@/lib/toc";
import type { AppState } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseAppReturn extends AppState {
  openDirectory: () => Promise<void>;
  openDirectoryFromPath: (path: string) => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  toggleSidebar: () => void;
  handleFileDrop: (paths: string[]) => Promise<void>;
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
};

export function useApp(): UseAppReturn {
  const [state, setState] = useState<AppState>(() => ({
    ...initialState,
    isSidebarOpen: getSidebarState(),
    history: getHistory(),
  }));

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

  return {
    ...state,
    openDirectory,
    openDirectoryFromPath,
    selectFile,
    toggleSidebar,
    handleFileDrop,
  };
}
