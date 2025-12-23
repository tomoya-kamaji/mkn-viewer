import type { FileNode, HistoryEntry, ThemeMode } from "@/types";
import { FileTree } from "./FileTree";
import { History } from "./History";
import { ThemeSelector } from "./ThemeSelector";

interface SidebarProps {
  isOpen: boolean;
  fileTree: FileNode[];
  selectedFile: string | null;
  history: HistoryEntry[];
  currentDirectory: string | null;
  theme: ThemeMode;
  onSelectFile: (path: string) => void;
  onOpenDirectory: () => void;
  onOpenDirectoryFromPath: (path: string) => void;
  onToggle: () => void;
  onThemeChange: (theme: ThemeMode) => void;
}

export function Sidebar({
  isOpen,
  fileTree,
  selectedFile,
  history,
  currentDirectory,
  theme,
  onSelectFile,
  onOpenDirectory,
  onOpenDirectoryFromPath,
  onToggle,
  onThemeChange,
}: SidebarProps) {
  return (
    <>
      {/* トグルボタン（サイドバーが閉じているとき） */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 p-2 bg-surface-100 dark:bg-surface-900 rounded-lg shadow-md hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
          title="サイドバーを開く (⌘B)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-surface-100 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
          transition-transform duration-200 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ width: "280px" }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100">
            エクスプローラー
          </h2>
          <div className="flex gap-1">
            <ThemeSelector currentTheme={theme} onThemeChange={onThemeChange} />
            <button
              type="button"
              onClick={onOpenDirectory}
              className="p-1.5 hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors"
              title="フォルダを開く"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors"
              title="サイドバーを閉じる (⌘B)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col h-[calc(100%-57px)] overflow-hidden">
          {/* ファイルツリー */}
          {fileTree.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {currentDirectory && (
                  <div className="px-2 py-1 text-xs text-surface-800 dark:text-surface-200 truncate mb-2">
                    {currentDirectory.split("/").pop()}
                  </div>
                )}
                <FileTree
                  nodes={fileTree}
                  selectedFile={selectedFile}
                  onSelectFile={onSelectFile}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-surface-800 dark:text-surface-200 text-sm p-4">
              フォルダを選択してください
            </div>
          )}

          {/* 履歴 */}
          {history.length > 0 && (
            <div className="border-t border-surface-200 dark:border-surface-800">
              <History
                history={history}
                currentDirectory={currentDirectory}
                onOpenDirectory={onOpenDirectoryFromPath}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
