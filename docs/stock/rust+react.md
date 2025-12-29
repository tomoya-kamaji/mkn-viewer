# Tauri: React と Rust の連携の仕組み

## 概要

Tauri は React（フロントエンド）と Rust（バックエンド）を IPC（プロセス間通信）で接続するフレームワーク。

```
┌─────────────────────────────────────────────────┐
│                    Tauri App                    │
│  ┌───────────────┐      ┌───────────────────┐  │
│  │   React       │ IPC  │      Rust         │  │
│  │  (WebView)    │◄────►│   (バックエンド)    │  │
│  └───────────────┘      └───────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 通信の流れ

### 1. Rust 側：コマンドを定義

`#[tauri::command]` 属性を付けた関数は React から呼び出せる。

```rust
// src-tauri/src/commands.rs

#[tauri::command]
pub fn scan_directory(path: String) -> Result<Vec<FileNode>, String> {
    // ファイルシステムをスキャン
    let root_path = Path::new(&path);
    build_file_tree(root_path)
}
```

### 2. Rust 側：コマンドを登録

`main.rs` で `invoke_handler` にコマンドを登録。

```rust
// src-tauri/src/main.rs

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            scan_directory,       // ← ここで登録
            read_file_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. React 側：invoke で呼び出し

`@tauri-apps/api/tauri` の `invoke` 関数で Rust コマンドを呼び出す。

```typescript
// src/lib/tauri.ts

import { invoke } from "@tauri-apps/api/tauri";

export async function scanDirectory(path: string): Promise<FileNode[]> {
  return await invoke<FileNode[]>("scan_directory", { path });
  //                  ↑ Rust関数名        ↑ 引数（オブジェクト形式）
}
```

### 4. React コンポーネントから使用

```typescript
// src/hooks/useApp.ts

const openDirectoryFromPath = async (path: string) => {
  const fileTree = await scanDirectory(path); // Rustを呼び出し
  // 結果を状態に反映
};
```

## データの流れ

```
React                              Rust
  │                                  │
  │  invoke("scan_directory",        │
  │         { path: "/Users/..." })  │
  │ ──────────────────────────────►  │
  │         (JSON形式)               │
  │                                  │
  │                                  │ std::fs でファイル読み込み
  │                                  │ walkdir でディレクトリ走査
  │                                  │
  │  ◄──────────────────────────────  │
  │    Result<Vec<FileNode>, String> │
  │         (JSON形式で返却)          │
  │                                  │
```

## 型の対応

| Rust           | TypeScript             | 備考                          |
| -------------- | ---------------------- | ----------------------------- |
| `String`       | `string`               |                               |
| `Vec<T>`       | `T[]`                  |                               |
| `Option<T>`    | `T \| null`            |                               |
| `Result<T, E>` | Promise（成功/エラー） |                               |
| `struct`       | `interface`            | `#[derive(Serialize)]` が必要 |

### Rust の構造体定義

```rust
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]  // JSのキャメルケースに変換
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_directory: bool,           // → isDirectory
    pub children: Option<Vec<FileNode>>,
}
```

### TypeScript の型定義

```typescript
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}
```

## セキュリティ

`tauri.conf.json` の `allowlist` で許可する機能を制限。

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "dialog": { "open": true },
      "fs": { "readFile": true, "scope": ["**"] }
    }
  }
}
```

## まとめ

| 役割                       | 担当         |
| -------------------------- | ------------ |
| UI・状態管理・レンダリング | React        |
| ファイルシステム・OS 機能  | Rust         |
| 通信・ブリッジ             | Tauri（IPC） |

Tauri は「薄い接着剤」として機能し、フロントエンドの自由度を保ちつつ、ネイティブ機能へのアクセスを提供する。
