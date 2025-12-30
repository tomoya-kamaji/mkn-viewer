import { getErrorMessage } from "@/lib/error";
import { addToHistory, getHistory } from "@/lib/storage";
import { openDirectoryDialog, readFileContent, scanDirectory } from "@/lib/tauri";
import { generateToc } from "@/lib/toc";
import type { FileNode, HistoryEntry, TocItem } from "@/types";
import { useCallback, useState } from "react";

interface FileSystemState {
  currentDirectory: string | null;
  selectedFile: string | null;
  fileTree: FileNode[];
  markdownContent: string;
  toc: TocItem[];
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
}

interface UseFileSystemReturn extends FileSystemState {
  openDirectory: () => Promise<void>;
  openDirectoryFromPath: (path: string) => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  handleFileDrop: (paths: string[]) => Promise<void>;
  clearError: () => void;
}

const initialState: FileSystemState = {
  currentDirectory: null,
  selectedFile: null,
  fileTree: [],
  markdownContent: "",
  toc: [],
  history: [],
  isLoading: false,
  error: null,
};

/**
 * ファイルシステム操作を管理するカスタムフック
 */
export function useFileSystem(): UseFileSystemReturn {
  const [state, setState] = useState<FileSystemState>(() => ({
    ...initialState,
    history: getHistory(),
  }));

  const updateState = useCallback((updates: Partial<FileSystemState>) => {
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
          error: getErrorMessage(error),
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
      updateState({ error: getErrorMessage(error) });
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
          error: getErrorMessage(error),
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

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    ...state,
    openDirectory,
    openDirectoryFromPath,
    selectFile,
    handleFileDrop,
    clearError,
  };
}
