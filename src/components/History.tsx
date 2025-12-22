import { useState } from "react";
import type { HistoryEntry } from "@/types";

interface HistoryProps {
  history: HistoryEntry[];
  currentDirectory: string | null;
  onOpenDirectory: (path: string) => void;
}

export function History({ history, currentDirectory, onOpenDirectory }: HistoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-800 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        履歴
      </button>

      {isExpanded && (
        <ul className="pb-2">
          {history.map((entry) => {
            const folderName = entry.path.split("/").pop() ?? entry.path;
            const isCurrent = entry.path === currentDirectory;

            return (
              <li key={entry.path}>
                <button
                  type="button"
                  onClick={() => onOpenDirectory(entry.path)}
                  disabled={isCurrent}
                  className={`
                    w-full flex items-center gap-2 px-4 py-1.5 text-sm text-left
                    transition-colors truncate
                    ${
                      isCurrent
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100"
                        : "hover:bg-surface-200 dark:hover:bg-surface-800"
                    }
                  `}
                  title={entry.path}
                >
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="truncate">{folderName}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

