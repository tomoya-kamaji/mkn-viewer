interface WelcomeProps {
  onOpenDirectory: () => void;
}

export function Welcome({ onOpenDirectory }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <svg
            className="w-14 h-14 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">mkn</h1>
        <p className="text-surface-800 dark:text-surface-200 text-lg">
          高速・軽量なMarkdownビューアー
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenDirectory}
        className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        フォルダを開く
      </button>

      <p className="mt-6 text-sm text-surface-800 dark:text-surface-200">
        または、ファイルやフォルダをドラッグ＆ドロップ
      </p>

      <div className="mt-8 text-xs text-surface-800 dark:text-surface-200">
        <kbd className="px-2 py-1 bg-surface-200 dark:bg-surface-800 rounded text-xs font-mono">
          ⌘ B
        </kbd>
        <span className="ml-2">サイドバーの表示/非表示</span>
      </div>
    </div>
  );
}
