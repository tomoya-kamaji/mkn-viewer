import type { GrepResult } from "@/types";
import { useEffect, useRef } from "react";

interface SearchPanelProps {
  currentDirectory: string | null;
  searchQuery: string;
  searchResults: GrepResult[];
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onSelectFile: (path: string) => void;
}

export function SearchPanel({
  currentDirectory,
  searchQuery,
  searchResults,
  isLoading,
  onSearchChange,
  onSelectFile,
}: SearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 検索入力フィールドにフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // マッチ箇所をハイライト表示
  const highlightMatch = (lineContent: string, matchStart: number, matchEnd: number) => {
    const before = lineContent.slice(0, matchStart);
    const match = lineContent.slice(matchStart, matchEnd);
    const after = lineContent.slice(matchEnd);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded px-0.5">
          {match}
        </mark>
        {after}
      </>
    );
  };

  // ファイルごとにグループ化
  const groupedResults = searchResults.reduce(
    (acc, result) => {
      const key = result.filePath;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key]?.push(result);
      return acc;
    },
    {} as Record<string, GrepResult[]>
  );

  return (
    <div className="flex flex-col h-full">
      {/* 検索入力 */}
      <div className="p-2 border-b border-surface-200 dark:border-surface-800">
        <div className="relative">
          <svg
            className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 dark:text-surface-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="検索..."
            className="w-full pl-8 pr-2 py-1.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-surface-900 dark:text-surface-100"
          />
        </div>
      </div>

      {/* 検索結果 */}
      <div className="flex-1 overflow-y-auto">
        {!currentDirectory ? (
          <div className="flex items-center justify-center h-full text-surface-500 dark:text-surface-400 text-sm p-4">
            フォルダを選択してください
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full text-surface-500 dark:text-surface-400 text-sm p-4">
            検索中...
          </div>
        ) : searchQuery.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-500 dark:text-surface-400 text-sm p-4">
            検索キーワードを入力してください
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-500 dark:text-surface-400 text-sm p-4">
            見つかりませんでした
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedResults).map(([filePath, results]) => {
              const firstResult = results[0];
              if (!firstResult) {
                return null;
              }

              return (
                <div key={filePath} className="mb-4 last:mb-0">
                  {/* ファイル名 */}
                  <button
                    type="button"
                    onClick={() => onSelectFile(filePath)}
                    className="w-full text-left px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-surface-200 dark:hover:bg-surface-800 rounded truncate"
                  >
                    {firstResult.fileName}
                  </button>

                  {/* マッチした行 */}
                  <ul className="mt-1 space-y-0.5">
                    {results.map((result, idx) => (
                      <li key={`${filePath}-${result.lineNumber}-${idx}`}>
                        <button
                          type="button"
                          onClick={() => onSelectFile(filePath)}
                          className="w-full text-left px-2 py-1 text-xs hover:bg-surface-200 dark:hover:bg-surface-800 rounded transition-colors"
                        >
                          <span className="text-surface-500 dark:text-surface-400 mr-2">
                            {result.lineNumber}:
                          </span>
                          <span className="text-surface-900 dark:text-surface-100 font-mono">
                            {highlightMatch(result.lineContent, result.matchStart, result.matchEnd)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
