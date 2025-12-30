import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { MarkdownViewer } from "./components/MarkdownViewer";
import { Sidebar } from "./components/Sidebar";
import { TableOfContents } from "./components/TableOfContents";
import { Welcome } from "./components/Welcome";
import { useApp } from "./hooks/useApp";

interface FileDropPayload {
  paths: string[];
}

function App() {
  const {
    currentDirectory,
    selectedFile,
    fileTree,
    markdownContent,
    isSidebarOpen,
    toc,
    history,
    isLoading,
    error,
    theme,
    searchQuery,
    searchResults,
    isSearching,
    openDirectory,
    openDirectoryFromPath,
    selectFile,
    toggleSidebar,
    handleFileDrop,
    changeTheme,
    searchFiles,
  } = useApp();

  // ファイルドロップイベントのリスナー
  useEffect(() => {
    const unlisten = listen<FileDropPayload>("tauri://file-drop", (event) => {
      handleFileDrop(event.payload.paths);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [handleFileDrop]);

  const fileName = selectedFile?.split("/").pop() ?? "";

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
            <ErrorMessage message={error} onRetry={openDirectory} />
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

export default App;
