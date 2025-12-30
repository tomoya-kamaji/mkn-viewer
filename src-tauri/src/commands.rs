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

/// Grep検索結果
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GrepResult {
    /// ファイルのフルパス
    pub file_path: String,
    /// ファイル名
    pub file_name: String,
    /// 行番号（1始まり）
    pub line_number: usize,
    /// 行の内容
    pub line_content: String,
    /// マッチ開始位置（文字列内）
    pub match_start: usize,
    /// マッチ終了位置（文字列内）
    pub match_end: usize,
}

/// ディレクトリ選択ダイアログを開く
#[tauri::command]
pub fn open_directory_dialog() -> CommandResult<String> {
    let folder = FileDialogBuilder::new()
        .set_title("フォルダを選択")
        .pick_folder();

    match folder {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err(AppError::DialogCancelled.into_string()),
    }
}

/// ディレクトリを再帰的にスキャンして.md/.mdcファイルのツリーを返す
#[tauri::command]
pub fn scan_directory(path: String) -> CommandResult<Vec<FileNode>> {
    let root_path = Path::new(&path);

    if !root_path.exists() {
        return Err(AppError::FileNotFound(path).into_string());
    }

    if !root_path.is_dir() {
        return Err(
            AppError::ScanError("指定されたパスはディレクトリではありません".to_string())
                .into_string(),
        );
    }

    build_file_tree(root_path)
}

/// ファイルの内容を読み込む
#[tauri::command]
pub fn read_file_content(path: String) -> CommandResult<String> {
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(AppError::FileNotFound(path).into_string());
    }

    fs::read_to_string(file_path).map_err(|e| AppError::ReadError(e.to_string()).into_string())
}

/// 無視するディレクトリ名
const IGNORED_DIRS: &[&str] = &["node_modules", "target", "dist", ".git"];

/// ディレクトリを無視すべきかどうか
fn should_ignore_dir(name: &str) -> bool {
    IGNORED_DIRS.contains(&name)
}

/// ファイルツリーを構築
fn build_file_tree(root: &Path) -> CommandResult<Vec<FileNode>> {
    let mut entries: Vec<FileNode> = Vec::new();

    // まず直下のエントリを収集
    let read_dir = fs::read_dir(root)
        .map_err(|e| AppError::ScanError(format!("読み込みエラー: {}", e)).into_string())?;

    for entry in read_dir.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // 無視するディレクトリをスキップ
        if path.is_dir() && should_ignore_dir(&name) {
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
        .filter_entry(|e| {
            // 無視するディレクトリをスキップ
            if e.file_type().is_dir() {
                let name = e.file_name().to_string_lossy();
                return !should_ignore_dir(&name);
            }
            true
        })
        .filter_map(|e| e.ok())
        .any(|e| is_markdown_file(e.path()))
}

/// ディレクトリ内のMarkdownファイルを検索
#[tauri::command]
pub fn grep_directory(path: String, query: String) -> CommandResult<Vec<GrepResult>> {
    let root_path = Path::new(&path);

    if !root_path.exists() {
        return Err(AppError::FileNotFound(path).into_string());
    }

    if !root_path.is_dir() {
        return Err(
            AppError::ScanError("指定されたパスはディレクトリではありません".to_string())
                .into_string(),
        );
    }

    if query.is_empty() {
        return Ok(Vec::new());
    }

    let mut results: Vec<GrepResult> = Vec::new();

    // ディレクトリを再帰的に走査
    for entry in WalkDir::new(root_path)
        .max_depth(100)
        .into_iter()
        .filter_entry(|e| {
            // 無視するディレクトリをスキップ
            if e.file_type().is_dir() {
                let name = e.file_name().to_string_lossy();
                return !should_ignore_dir(&name);
            }
            true
        })
        .filter_map(|e| e.ok())
    {
        let file_path = entry.path();

        // Markdownファイルのみ処理
        if !is_markdown_file(file_path) {
            continue;
        }

        // ファイルを読み込む
        let content = match fs::read_to_string(file_path) {
            Ok(c) => c,
            Err(_) => continue, // 読み込みエラーはスキップ
        };

        // ファイル名を取得
        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        // 各行を検索
        for (line_idx, line) in content.lines().enumerate() {
            // 大文字小文字を区別しない検索
            if let Some(match_start) = line.to_lowercase().find(&query.to_lowercase()) {
                let match_end = match_start + query.len();
                results.push(GrepResult {
                    file_path: file_path.to_string_lossy().to_string(),
                    file_name: file_name.clone(),
                    line_number: line_idx + 1, // 1始まり
                    line_content: line.to_string(),
                    match_start,
                    match_end,
                });
            }
        }
    }

    Ok(results)
}
