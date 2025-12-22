use crate::error::{AppError, CommandResult};
use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri::api::dialog::blocking::FileDialogBuilder;
use walkdir::WalkDir;

/// ファイルノード（ファイルツリーの要素）
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    /// ファイル/フォルダ名
    pub name: String,
    /// フルパス
    pub path: String,
    /// ディレクトリかどうか
    pub is_directory: bool,
    /// 子ノード（ディレクトリの場合）
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileNode>>,
}

/// ディレクトリ選択ダイアログを開く
#[tauri::command]
pub fn open_directory_dialog() -> CommandResult<String> {
    let folder = FileDialogBuilder::new()
        .set_title("フォルダを選択")
        .pick_folder();

    match folder {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err(AppError::DialogCancelled),
    }
}

/// ディレクトリを再帰的にスキャンして.md/.mdcファイルのツリーを返す
#[tauri::command]
pub fn scan_directory(path: String) -> CommandResult<Vec<FileNode>> {
    let root_path = Path::new(&path);

    if !root_path.exists() {
        return Err(AppError::FileNotFound(path));
    }

    if !root_path.is_dir() {
        return Err(AppError::ScanError(
            "指定されたパスはディレクトリではありません".to_string(),
        ));
    }

    build_file_tree(root_path)
}

/// ファイルの内容を読み込む
#[tauri::command]
pub fn read_file_content(path: String) -> CommandResult<String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(AppError::FileNotFound(path));
    }

    fs::read_to_string(file_path).map_err(|e| AppError::ReadError(e.to_string()))
}

/// ファイルツリーを構築
fn build_file_tree(root: &Path) -> CommandResult<Vec<FileNode>> {
    let mut entries: Vec<FileNode> = Vec::new();

    // まず直下のエントリを収集
    let read_dir =
        fs::read_dir(root).map_err(|e| AppError::ScanError(format!("読み込みエラー: {}", e)))?;

    for entry in read_dir.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // 隠しファイル/フォルダをスキップ
        if name.starts_with('.') {
            continue;
        }

        if path.is_dir() {
            // ディレクトリの場合、Markdownファイルを含むかチェック
            if contains_markdown_files(&path) {
                let children = build_file_tree(&path)?;
                entries.push(FileNode {
                    name,
                    path: path.to_string_lossy().to_string(),
                    is_directory: true,
                    children: Some(children),
                });
            }
        } else if is_markdown_file(&path) {
            entries.push(FileNode {
                name,
                path: path.to_string_lossy().to_string(),
                is_directory: false,
                children: None,
            });
        }
    }

    // 名前でソート（ディレクトリを先に）
    entries.sort_by(|a, b| match (a.is_directory, b.is_directory) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(entries)
}

/// パスがMarkdownファイルかどうかを判定
fn is_markdown_file(path: &Path) -> bool {
    match path.extension() {
        Some(ext) => {
            let ext_str = ext.to_string_lossy().to_lowercase();
            ext_str == "md" || ext_str == "mdc"
        }
        None => false,
    }
}

/// ディレクトリ内にMarkdownファイルが含まれるかチェック
fn contains_markdown_files(dir: &Path) -> bool {
    WalkDir::new(dir)
        .max_depth(10) // 深すぎる階層は無視
        .into_iter()
        .filter_map(|e| e.ok())
        .any(|e| is_markdown_file(e.path()))
}
