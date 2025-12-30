import {
  addToHistory,
  getHistory,
  getSidebarState,
  getTheme,
  setSidebarState,
  setTheme,
} from "@/lib/storage";
import { grepDirectory, openDirectoryDialog, readFileContent, scanDirectory } from "@/lib/tauri";
import { generateToc } from "@/lib/toc";
import type { AppState, GrepResult, ThemeMode } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAppReturn extends AppState {
  openDirectory: () => Promise<void>;
  openDirectoryFromPath: (path: string) => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  toggleSidebar: () => void;
  handleFileDrop: (paths: string[]) => Promise<void>;
  changeTheme: (theme: ThemeMode) => void;
  searchQuery: string;
  searchResults: GrepResult[];
  isSearching: boolean;
  searchFiles: (query: string) => Promise<void>;
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GrepResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // テーマ適用
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = state.theme;

    if (currentTheme === "system") {
      // OS設定に従う
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  const toggleSidebar = useCallback(() => {
    setState((prev) => {
      const newState = !prev.isSidebarOpen;
      setSidebarState(newState);
      return { ...prev, isSidebarOpen: newState };
    });
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B でサイドバーのトグル
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      // Cmd/Ctrl + Shift + F で検索タブにフォーカス
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        // サイドバーが閉じている場合は開く
        if (!state.isSidebarOpen) {
          toggleSidebar();
        }
        // 検索タブに切り替える処理はSidebarコンポーネント側で行う
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isSidebarOpen, toggleSidebar]);

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

  const searchFiles = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      // デバウンス: 300ms待機
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      if (!state.currentDirectory) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      const directory = state.currentDirectory;
      if (!directory) {
        setIsSearching(false);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await grepDirectory(directory, query);
          setSearchResults(results);
        } catch (error) {
          console.error("検索エラー:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [state.currentDirectory]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    openDirectory,
    openDirectoryFromPath,
    selectFile,
    toggleSidebar,
    handleFileDrop,
    changeTheme,
    searchQuery,
    searchResults,
    isSearching,
    searchFiles,
  };
}
