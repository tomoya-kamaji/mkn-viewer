import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { MarkdownViewer } from "./components/MarkdownViewer";
import { Sidebar } from "./components/Sidebar";
import { TableOfContents } from "./components/TableOfContents";
import { Welcome } from "./components/Welcome";
import { ErrorProvider, useError } from "./contexts/ErrorContext";
import { useFileSystem } from "./hooks/useFileSystem";
import { useSearch } from "./hooks/useSearch";
import { useShortcut } from "./hooks/useShortcut";
import { useSidebar } from "./hooks/useSidebar";
import { useTheme } from "./hooks/useTheme";

interface FileDropPayload {
  paths: string[];
}

function AppContent() {
  // 各フックを個別に呼び出し
  const { theme, changeTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar, openSidebar } = useSidebar();
  const { error, clearError } = useError();
  const {
    currentDirectory,
    selectedFile,
    fileTree,
    markdownContent,
    toc,
    history,
    isLoading,
    openDirectory,
    openDirectoryFromPath,
    selectFile,
    handleFileDrop,
  } = useFileSystem();
  const { searchQuery, searchResults, isSearching, searchFiles } = useSearch(currentDirectory);

  // ファイルドロップイベントのリスナー
  useEffect(() => {
    const unlisten = listen<FileDropPayload>("tauri://file-drop", (event) => {
      handleFileDrop(event.payload.paths);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [handleFileDrop]);

  // キーボードショートカット: Cmd/Ctrl + Shift + F で検索タブにフォーカス
  const handleFocusSearch = useCallback(() => {
    // サイドバーが閉じている場合は開く
    if (!isSidebarOpen) {
      openSidebar();
    }
    // 検索タブに切り替える処理はSidebarコンポーネント側で行う
  }, [isSidebarOpen, openSidebar]);

  useShortcut("focusSearch", handleFocusSearch);

  const fileName = selectedFile?.split("/").pop() ?? "";

  const handleRetry = () => {
    clearError();
    openDirectory();
  };

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100">
      {/* サイドバー */}
      <Sidebar
        isOpen={isSidebarOpen}
        fileTree={fileTree}
        selectedFile={selectedFile}
        history={history}
        currentDirectory={currentDirectory}
        theme={theme}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        onSelectFile={selectFile}
        onOpenDirectory={openDirectory}
        onOpenDirectoryFromPath={openDirectoryFromPath}
        onToggle={toggleSidebar}
        onThemeChange={changeTheme}
        onSearchChange={searchFiles}
      />

      {/* メインコンテンツ */}
      <main
        className={`flex-1 flex transition-all duration-200 ${
          isSidebarOpen ? "ml-[280px]" : "ml-0"
        }`}
      >
        {isLoading ? (
          <div className="flex-1">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex-1">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        ) : markdownContent ? (
          <>
            {/* Markdownビューア */}
            <div className="flex-1 min-w-0">
              <MarkdownViewer content={markdownContent} fileName={fileName} theme={theme} />
            </div>
            {/* 目次 */}
            {toc.length > 0 && <TableOfContents toc={toc} />}
          </>
        ) : (
          <div className="flex-1">
            <Welcome onOpenDirectory={openDirectory} />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorProvider>
      <AppContent />
    </ErrorProvider>
  );
}

export default App;
