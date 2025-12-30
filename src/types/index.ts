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

/** Grep検索結果 */
export interface GrepResult {
  /** ファイルのフルパス */
  filePath: string;
  /** ファイル名 */
  fileName: string;
  /** 行番号（1始まり） */
  lineNumber: number;
  /** 行の内容 */
  lineContent: string;
  /** マッチ開始位置（文字列内） */
  matchStart: number;
  /** マッチ終了位置（文字列内） */
  matchEnd: number;
}
