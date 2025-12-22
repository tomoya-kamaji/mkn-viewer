import type { FileNode } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";

/**
 * ディレクトリ選択ダイアログを開く
 */
export async function openDirectoryDialog(): Promise<string | null> {
  try {
    return await invoke<string>("open_directory_dialog");
  } catch (error) {
    // ダイアログがキャンセルされた場合
    if (String(error).includes("キャンセル")) {
      return null;
    }
    throw error;
  }
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
