use thiserror::Error;

/// アプリケーションエラー
#[derive(Error, Debug)]
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

/// コマンドの結果型（Tauriはstringエラーを返す）
pub type CommandResult<T> = Result<T, String>;

impl AppError {
    /// エラーを文字列に変換
    pub fn into_string(self) -> String {
        self.to_string()
    }
}

