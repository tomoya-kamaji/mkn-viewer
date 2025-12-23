/** ファイルツリーのノード */
export interface FileNode {
  /** ファイル/フォルダ名 */
  name: string;
  /** フルパス */
  path: string;
  /** ディレクトリかどうか */
  isDirectory: boolean;
  /** 子ノード（ディレクトリの場合） */
  children?: FileNode[];
}

/** 履歴エントリ */
export interface HistoryEntry {
  /** ディレクトリパス */
  path: string;
  /** 最後にアクセスした日時 */
  accessedAt: string;
}

/** 目次アイテム */
export interface TocItem {
  /** 見出しID */
  id: string;
  /** 見出しテキスト */
  text: string;
  /** 見出しレベル（1-6） */
  level: number;
}

/** テーマモード */
export type ThemeMode = "system" | "dark" | "dracula" | "one-dark";

/** アプリケーションの状態 */
export interface AppState {
  /** 現在選択されているディレクトリ */
  currentDirectory: string | null;
  /** 現在選択されているファイル */
  selectedFile: string | null;
  /** ファイルツリー */
  fileTree: FileNode[];
  /** Markdownコンテンツ */
  markdownContent: string;
  /** サイドバーの開閉状態 */
  isSidebarOpen: boolean;
  /** 目次 */
  toc: TocItem[];
  /** 履歴 */
  history: HistoryEntry[];
  /** ロード中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** テーマモード */
  theme: ThemeMode;
}
