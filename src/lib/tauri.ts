import type { FileNode } from "@/types";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

/**
 * ディレクトリ選択ダイアログを開く（非同期・ノンブロッキング）
 */
export async function openDirectoryDialog(): Promise<string | null> {
  const result = await open({
    directory: true,
    title: "フォルダを選択",
  });

  if (result === null) {
    return null; // キャンセル
  }

  // 複数選択の場合は配列、単一の場合は文字列
  return Array.isArray(result) ? result[0] ?? null : result;
}

/**
 * ディレクトリをスキャンしてファイルツリーを取得
 */
export async function scanDirectory(path: string): Promise<FileNode[]> {
  return await invoke<FileNode[]>("scan_directory", { path });
}

/**
 * ファイルの内容を読み込む
 */
export async function readFileContent(path: string): Promise<string> {
  return await invoke<string>("read_file_content", { path });
}
