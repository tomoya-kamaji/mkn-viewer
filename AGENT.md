# AGENT.md

このファイルは AI エージェント（Cursor, GitHub Copilot 等）向けのプロジェクト情報です。

---

## プロジェクト概要

Tauri + Rust + React で構築した軽量 Markdown ビューアーデスクトップアプリケーション。

---

## 技術スタック

| カテゴリ             | 技術              |
| -------------------- | ----------------- |
| フレームワーク       | Tauri 1.5         |
| バックエンド         | Rust              |
| フロントエンド       | React 18          |
| スタイリング         | Tailwind CSS 3    |
| ビルドツール         | Vite 6            |
| パッケージマネージャ | Bun               |
| Linter/Formatter     | Biome             |
| Git Hooks            | Lefthook          |
| 言語                 | TypeScript / Rust |

---

## ディレクトリ構成

```
src/                        # Reactフロントエンド
├── components/             # UIコンポーネント
│   ├── FileTree.tsx        # ファイルツリー
│   ├── History.tsx         # 履歴
│   ├── MarkdownViewer.tsx  # Markdownプレビュー
│   ├── Sidebar.tsx         # サイドバー
│   ├── TableOfContents.tsx # 目次
│   ├── ThemeSelector.tsx   # テーマ選択
│   └── Welcome.tsx         # ウェルカム画面
├── hooks/
│   └── useApp.ts           # アプリ状態管理
├── lib/
│   ├── storage.ts          # localStorage操作
│   ├── tauri.ts            # Tauri API ラッパー
│   └── toc.ts              # 目次生成
├── types/
│   └── index.ts            # 型定義
├── App.tsx                 # メインコンポーネント
├── main.tsx                # エントリーポイント
└── index.css               # グローバルスタイル

src-tauri/                  # Rustバックエンド
├── src/
│   ├── main.rs             # Tauriエントリーポイント
│   ├── commands.rs         # Tauriコマンド（ファイル操作）
│   └── error.rs            # エラー型定義
├── Cargo.toml              # Rust依存関係
└── tauri.conf.json         # Tauri設定

docs/
└── stock/
    └── rust+react.md       # ReactとRustの連携の仕組み
```

---

## 開発コマンド

### 基本

```bash
# 開発サーバー起動（Tauri + Vite）
bun run tauri:dev

# Viteのみ（ブラウザで確認）
bun run dev

# プロダクションビルド
bun run tauri:build
```

### Lint / Format（Biome）

```bash
# チェック（lint + format）
bun run check

# 自動修正
bun run lint:fix

# Formatのみ
bun run format
```

### パッケージ管理

```bash
# パッケージインストール
bun install

# パッケージ追加
bun add <package>

# 開発依存追加
bun add -d <package>
```

---

## 主要機能

| 機能                 | 説明                                      |
| -------------------- | ----------------------------------------- |
| ディレクトリスキャン | `.md` / `.mdc` ファイルを再帰的に表示     |
| Markdown プレビュー  | GFM、シンタックスハイライト、Mermaid 対応 |
| 目次自動生成         | h1-h6 から自動生成、クリックでジャンプ    |
| 履歴機能             | 過去に開いたディレクトリを 10 件まで保持  |
| テーマ切替           | System / Dark / Dracula / One Dark        |
| ドラッグ&ドロップ    | フォルダをドロップして開く                |

---

## 実装時のガイドライン

### コード品質

- **コード改修時には lint と format を実行してください**
  ```bash
  bun run check   # チェック
  bun run lint:fix  # 自動修正
  ```

### React ↔ Rust 連携

- Rust コマンドは `src-tauri/src/commands.rs` で定義
- `#[tauri::command]` 属性を付けて React から呼び出し可能にする
- React からは `invoke()` で呼び出し（`src/lib/tauri.ts`）
- 詳細は `docs/stock/rust+react.md` を参照

### ファイルスキャン時の除外

以下のディレクトリは自動的に除外される：

- `node_modules`
- `target`
- `dist`
- `.git`

### スタイリング

- Tailwind CSS 3 を使用
- CSS 変数でテーマ管理（`src/index.css`）
- フォント: Noto Sans JP（本文）、JetBrains Mono（コード）

