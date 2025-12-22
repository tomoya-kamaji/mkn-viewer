use serde::Serialize;
use thiserror::Error;

/// アプリケーションエラー
#[derive(Error, Debug, Serialize)]
pub enum AppError {
    #[error("ファイルが見つかりません: {0}")]
    FileNotFound(String),

    #[error("ファイルの読み込みに失敗しました: {0}")]
    ReadError(String),

    #[error("ディレクトリのスキャンに失敗しました: {0}")]
    ScanError(String),

    #[error("ダイアログがキャンセルされました")]
    DialogCancelled,
}

// Tauriのコマンドで使用するため、InvokeErrorへの変換を実装
impl From<AppError> for tauri::InvokeError {
    fn from(error: AppError) -> Self {
        tauri::InvokeError::from(error.to_string())
    }
}

/// コマンドの結果型
pub type CommandResult<T> = Result<T, AppError>;

